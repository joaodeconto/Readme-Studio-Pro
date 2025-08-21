import { $, $$ } from '../utils/dom';
import { log } from '../utils/log';
import { mdToHtml } from '../render/markdown';
import { highlightAll } from '../render/highlight';
import { applyEmojis } from '../features/emoji';
import { buildTOC } from '../features/toc';
import { toList, toCode, replaceSelection, getSelectionRanges } from '../features/insert.js';
import { TPL } from '../features/templates';
import { attachHistory } from '../state/history';
import { lintMarkdown } from '../utils/lint';
import { analisarRepo, proporPR } from '../github/fetch.js';
import { state, setAnalysis, setPR } from '../state/store';
import DiffMatchPatch from 'diff-match-patch';


interface RepoAnalysis {
  base_sha?: string;
  findings?: {
    headings?: unknown;
    toc?: unknown;
    relative_paths?: string[] | null;
    issues?: unknown[];
  };
  preview?: { new_content_utf8?: string };
}

interface PullRequest {
  pr_url: string;
}

interface Inputs {
  installation_id?: string;
  owner?: string;
  repo?: string;
  ref?: string;
  readme_path?: string;
  message?: string;
  base_sha?: string;
}

interface State {
  inputs: Inputs;
  analysis: RepoAnalysis | null;
  pr: PullRequest | null;
  original_readme?: string;
}

const stateCur = rawState as State;

type Step = 1 | 2 | 3;

const toastEl = $('#toast') as HTMLElement | null;
function toast(msg: string, type: 'info' | 'warn' | 'ok' | 'err' = 'info'): void {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.className = `toast ${type}`;
  setTimeout(() => (toastEl.className = 'toast'), 3000);
}

function renderLint(res: { issues: { sev: string; msg: string; line?: number }[] }): void {
  const panel = $('#lintPanel') as HTMLElement;
  const list = $('#lintList') as HTMLElement;
  const sum = $('#lintSummary') as HTMLElement;
  list.innerHTML = '';
  let errs = 0,
    warns = 0;
  res.issues.forEach(it => {
    if (it.sev === 'err') errs++;
    else if (it.sev === 'warn') warns++;
  });
  sum.textContent = `Erros: ${errs} • Avisos: ${warns} • Itens: ${res.issues.length}`;
  res.issues.forEach(it => {
    const li = document.createElement('li');
    li.className = it.sev;
    li.textContent = (it.line ? `L${it.line}: ` : '') + it.msg;
    list.appendChild(li);
  });
  panel.hidden = false;
}

function bindInsertionTools(
  mdEl: HTMLTextAreaElement,
  update: () => void,
): void {
  ($('#addBadge') as HTMLElement).onclick = () => {
    const L = ($('#bLabel') as HTMLInputElement).value || 'badge';
    const M = ($('#bMsg') as HTMLInputElement).value || 'ok';
    const C = (($('#bColor') as HTMLInputElement).value || 'blue').replace(/^#/, '');
    const G = ($('#bLogo') as HTMLInputElement).value;
    const url = `https://img.shields.io/badge/${encodeURIComponent(L)}-${encodeURIComponent(M)}-${C}${G ? `?logo=${encodeURIComponent(G)}` : ''}`;
    replaceSelection(mdEl, `![${L}](${url}) `);
    update();
  };
  ($('#addGHBadges') as HTMLElement).onclick = () => {
    const rr = (($('#ghRepo') as HTMLInputElement).value || '').trim();
    if (!rr || !rr.includes('/')) return alert('Use no formato owner/repo');
    const [o, r] = rr.split('/');
    const set = [
      `![stars](https://img.shields.io/github/stars/${o}/${r}?style=flat)`,
      `![forks](https://img.shields.io/github/forks/${o}/${r}?style=flat)`,
      `![issues](https://img.shields.io/github/issues/${o}/${r}?style=flat)`,
      `![license](https://img.shields.io/github/license/${o}/${r}?style=flat)`,
      `![last commit](https://img.shields.io/github/last-commit/${o}/${r}?style=flat)`,
    ].join(' ');
    replaceSelection(mdEl, set + '\n');
    update();
  };
  ($('#addCode') as HTMLElement).onclick = () => {
    toCode(mdEl, ($('#codeLang') as HTMLInputElement)?.value || '');
    update();
  };
  ($('#toCode') as HTMLElement).onclick = () => {
    toCode(mdEl, ($('#codeLang') as HTMLInputElement)?.value || '');
    update();
  };
  ($('#toList') as HTMLElement).onclick = () => {
    toList(mdEl);
    update();
  };
  ($('#addCall') as HTMLElement).onclick = () => {
    const t = ($('#callType') as HTMLInputElement).value || 'NOTE';
    replaceSelection(mdEl, `\n> [!${t}]\n> Texto do aviso.\n`);
    update();
  };
  ($('#addDetails') as HTMLElement).onclick = () => {
    const s = ($('#sumText') as HTMLInputElement).value || 'Mais detalhes';
    replaceSelection(mdEl, `\n<details>\n<summary>${s}</summary>\n\nConteúdo oculto\n\n</details>\n`);
    update();
  };
  ($('#addTable') as HTMLElement).onclick = () => {
    const r = parseInt((($('#rows') as HTMLInputElement).value || '2'), 10),
      c = parseInt((($('#cols') as HTMLInputElement).value || '3'), 10);
    let md = '\n|';
    for (let j = 0; j < c; j++) md += ` Col${j + 1} |`;
    md += '\n|' + Array(c).fill('---').join('|') + '|\n';
    for (let i = 0; i < r; i++) {
      md += '|';
      for (let j = 0; j < c; j++) md += ' dado |';
      md += '\n';
    }
    replaceSelection(mdEl, md + '\n');
    update();
  };
  ($('#addMermaid') as HTMLElement).onclick = () => {
    const k = ($('#mermKind') as HTMLInputElement).value;
    const ex = {
      flowchart: `\n\`\`\`mermaid\nflowchart TD\n  A[Start] --> B{Pergunta?}\n  B -- Sim --> C[Do it]\n  B -- Não --> D[Stop]\n\`\`\`\n`,
      sequence: `\n\`\`\`mermaid\nsequenceDiagram\n  participant U as Usuário\n  participant S as Sistema\n  U->>S: request\n  S-->>U: response\n\`\`\`\n`,
      gantt: `\n\`\`\`mermaid\n%%{init: {"theme": "neutral"}}%%\ngantt\n  title Roadmap\n  dateFormat  YYYY-MM-DD\n  section Core\n  Parser       :a1, 2025-08-01, 7d\n  UI           :after a1, 5d\n\`\`\`\n`,
      class: `\n\`\`\`mermaid\nclassDiagram\n  class Repo{\n    +string name\n    +clone()\n  }\n\`\`\`\n`,
    }[k];
    replaceSelection(mdEl, ex || '');
    update();
  };
  ($('#addSection') as HTMLElement).onclick = () => {
    const sel = ($('#section') as HTMLSelectElement).value;
    const map: Record<string, string> = {
      'Header com Badges': `# Nome do Projeto\n\n[![build](https://img.shields.io/badge/build-passing-brightgreen)](#) [![license](https://img.shields.io/badge/license-MIT-blue)](#)\n\nBreve descrição do que o projeto faz.\n\n---\n`,
      'Resumo / Pitch': `## Resumo\nExplique o problema, a solução e o impacto em 3–4 linhas.\n`,
      'Instalação': `## Instalação\n\n\`\`\`bash\n# ex.:\nnpm i\n# ou\npip install pacote\n\`\`\`\n`,
      'Uso': `## Uso\n\n\`\`\`bash\ncomando --help\n\`\`\`\n`,
      'Exemplos': `## Exemplos\n- Exemplo 1\n- Exemplo 2\n`,
      'Screenshots': `## Screenshots\n\n![Descrição](imgs/screenshot1.png)\n`,
      'Roadmap': `## Roadmap\n- [ ] Item 1\n- [ ] Item 2\n`,
      'Contribuindo': `## Contribuindo\nPRs são bem-vindos. Para mudanças maiores, abra uma issue.\n`,
      'Licença (MIT)': `## Licença\nMIT © Seu Nome\n`,
      'TOC (sumário)': `## Sumário\n<!-- o botão TOC automático gera a lista aqui -->\n`,
    };
    const block = map[sel] || '';
    if (block) {
      replaceSelection(mdEl, '\n' + block + '\n');
      update();
    }
  };
}

export function bindToolbar(): void {
  const mdEl = $('#md') as HTMLTextAreaElement;
  const prev = $('#preview') as HTMLElement;
  const tabs = $$('.tab') as HTMLElement[];
  const stats = $('#stats') as HTMLElement;
  const useEmoji = $('#useEmoji') as HTMLInputElement | null;
  const bakeEmoji = $('#bakeEmoji') as HTMLInputElement | null;
  const diffModal = $('#diff-modal') as HTMLElement | null;
  const diffView = $('#diff-view') as HTMLElement | null;
  const stepConnect = $('#step-connect') as HTMLElement;
  const app = $('#app') as HTMLElement;
  const btnAnalisar = $('#btn-analisar') as HTMLButtonElement | null;
  const btnPreview = $('#btn-preview') as HTMLButtonElement | null;
  const btnPrConfirm = $('#btn-pr-confirm') as HTMLButtonElement | null;
  let analysisReady = false;

  function setStep(n: Step): void {
    stepConnect.hidden = n !== 1;
    app.hidden = n === 1;
    if (diffModal) diffModal.hidden = n !== 3;
    if (btnAnalisar) btnAnalisar.disabled = n !== 2;
    if (btnPreview) btnPreview.disabled = (n !== 2) || !analysisReady;
    if (btnPrConfirm) btnPrConfirm.disabled = n !== 3;
  }

  $('#btn-voltar')?.addEventListener('click', () => { setStep(2); });
  setStep(1);

  function countStats(s: string): string {
    const noCode = s.replace(/```[\s\S]*?```/g, '');
    const words = (noCode.match(/[A-Za-zÀ-ÿ0-9_]+/g) || []).length;
    const heads = (noCode.match(/^#{1,6}\s/mg) || []).length;
    return `${words} palavras • ${heads} seções`;
  }

  function refreshPreview(): void {
    prev.innerHTML = mdToHtml(mdEl.value, { emojify: useEmoji?.checked });
    highlightAll(prev);
  }

  function update(): void {
    stats.textContent = countStats(mdEl.value);
    if (!mdEl.hidden) return;
    refreshPreview();
  }

  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.dataset.active = (x === t));
    const edit = t.dataset.tab === 'edit';
    mdEl.hidden = !edit; prev.hidden = edit;
    if (!edit) update();
  }));

  $('#btn-connect')?.addEventListener('click', () => {
    window.location.href = '/api/github/oauth/start';
  });

  $('#btn-demo')?.addEventListener('click', () => {
    mdEl.value = '# Projeto Demo\n\nComece a escrever o README aqui...';
    update();
    setStep(2);
    toast('Modo demo iniciado ✅', 'ok');
  });

  // analisar
  $('#btn-analisar')?.addEventListener('click', async () => {
    try {
      const { installation_id, owner, repo, ref, readme_path } = state.inputs;
      if (!installation_id || !owner || !repo) {
        toast('Selecione um repositório primeiro.', 'warn');
        return;
      }
      btnAnalisar.disabled = true;
      const data = await analisarRepo({ installation_id: Number(installation_id), owner, repo, ref, readme_path }) as RepoAnalysis;
      setAnalysis(data);
      if (data?.base_sha) stateCur.inputs.base_sha = data.base_sha;

      // mostrar findings
      $('#findings').textContent = JSON.stringify({
        headings: data.findings?.headings,
        toc: data.findings?.toc,
        relative_paths: data.findings?.relative_paths || null,
        issues: (data.findings?.issues || []).slice(0, 10)
      }, null, 2);

      // preview antes/depois
      const preview = data.preview?.new_content_utf8 || '';
      $('#preview-after').innerHTML = mdToHtml(preview);
      analysisReady = true;
      if (btnPreview) btnPreview.disabled = false;
      toast('Análise concluída ✅', 'ok');
    } catch (e) {
      console.error(e);
      if (e.message === 'NETWORK_FAILURE') toast('Falha de rede durante a análise', 'err');
      else toast('Falha na análise: ' + e.message, 'err');
    } finally {
      btnAnalisar.disabled = false;
    }
  });

  $('#btn-preview')?.addEventListener('click', () => {
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(stateCur.original_readme || '', mdEl.value);
    dmp.diff_cleanupSemantic(diff);
    if (diffView) diffView.innerHTML = dmp.diff_prettyHtml(diff);
    setStep(3);
  });

  // propor PR
  $('#btn-pr-confirm')?.addEventListener('click', async () => {
    try {
      const { installation_id, owner, repo, ref, readme_path, message, base_sha } = stateCur.inputs;
      if (!base_sha) { toast('Carregue um README primeiro.', 'warn'); return; }
      btnPrConfirm.disabled = true;
      const head = `readme-studio/update-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
      const pr = await proporPR({
        installation_id: Number(installation_id), owner, repo,
        base: ref || 'main', head, readme_path,
        message, base_sha,
        new_content_utf8: mdEl.value
      }) as PullRequest;
      setPR(pr);
      const link = $('#pr-link') as HTMLAnchorElement;
      link.href = pr.pr_url; link.textContent = 'Abrir PR';
      link.target = '_blank';
      toast('PR criado como draft 🚀', 'ok');
    } catch (e) {
      console.error(e);
      if (e.message === 'NETWORK_FAILURE') toast('Falha de rede ao criar PR', 'err');
      else toast('Falha ao criar PR: ' + e.message, 'err');
    } finally {
      btnPrConfirm.disabled = false;
      setStep(2);
    }
  });


  const history = attachHistory(mdEl, () => { update(); }) as { undo: () => void; redo: () => void };
  ($('#undo') as HTMLElement).onclick = () => history.undo();
  ($('#redo') as HTMLElement).onclick = () => history.redo();

  $('#toggleAdv').onclick = () => {
    const p = $('#advPanel');
    if (p) {
      p.hidden = !p.hidden;
      const g = $('#editorGrid');
      if (g) g.classList.toggle('full', p.hidden);
    }
  };
  $('#bold').onclick = () => {
    const sel = getSelectionRanges(mdEl);
    const txt = sel.text || 'texto';
    replaceSelection(mdEl, `**${txt}**`);
    update();
  };
  $('#heading').onclick = () => {
    const sel = getSelectionRanges(mdEl);
    let text = sel.text;
    if (!text) {
      const v = mdEl.value;
      let s = v.lastIndexOf('\n', sel.start - 1) + 1; if (s < 0) s = 0;
      let e = v.indexOf('\n', sel.start); if (e < 0) e = v.length;
      text = v.slice(s, e); mdEl.selectionStart = s; mdEl.selectionEnd = e;
    }
    const lines = text.split(/\r?\n/).map(l => l ? '# ' + l.replace(/^#+\s*/, '') : l);
    replaceSelection(mdEl, lines.join('\n'));
    update();
  };

  $('#new').onclick = () => { if (confirm('Limpar conteúdo?')) { mdEl.value = ''; update(); } };
  $('#save').onclick = () => {
    const bake = bakeEmoji?.checked;
    const out = bake ? applyEmojis(mdEl.value, true) : mdEl.value;
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(out);
    a.download = 'README.md'; a.click();
  };
  $('#copy').onclick = () => {
    const bake = bakeEmoji?.checked;
    const out = bake ? applyEmojis(mdEl.value, true) : mdEl.value;
    navigator.clipboard.writeText(out);
  };
  $('#open').onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.md,text/markdown,text/plain';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = () => { mdEl.value = r.result; update(); setStep(2); };
      r.readAsText(f);
    };
    inp.click();
  };

  bindInsertionTools(mdEl, update);

  // Gera template por stack
  $('#gen').onclick = () => {
    const s = ($('#stack') as HTMLInputElement).value;
    log('Gen template stack=', s);
    if (!s) return alert('Escolha uma stack');
    if (!TPL[s]) return alert('Template não encontrado para ' + s);
    let md = TPL[s];
    if (useEmoji?.checked) {
      md = applyEmojis(md, true);
    }
    mdEl.value = md;
    update();
  };

  $('#tocAuto').addEventListener('click', () => {
    const toc = buildTOC(mdEl.value, { useEmoji: useEmoji?.checked });
    if (!toc) return alert('Nenhum heading encontrado');
    replaceSelection(mdEl, `\n## Sumário\n${toc}\n`);
    update();
  });

  mdEl.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (e.ctrlKey && !e.shiftKey && k === 'b') { e.preventDefault(); $('#bold').click(); }
    else if (e.ctrlKey && !e.shiftKey && k === 'h') { e.preventDefault(); $('#heading').click(); }
    else if (e.ctrlKey && !e.shiftKey && k === 'l') { e.preventDefault(); $('#toList').click(); }
    else if (e.ctrlKey && e.shiftKey && k === 'c') { e.preventDefault(); $('#toCode').click(); }
    else if (e.ctrlKey && !e.shiftKey && k === 't') { e.preventDefault(); $('#tocAuto').click(); }
    else if (e.ctrlKey && !e.shiftKey && k === 'm') { e.preventDefault(); $('#toggleAdv').click(); }
  });

  ($('#lint') as HTMLElement).onclick = () => {
    const res = lintMarkdown(mdEl.value) as { issues: { sev: string; msg: string; line?: number }[] };
    renderLint(res);
  };

  update();
}
