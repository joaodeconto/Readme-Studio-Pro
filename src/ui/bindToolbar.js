import { $, $$ } from '../utils/dom.js';
import { log } from '../utils/log.js';
import { mdToHtml } from '../render/markdown.js';
import { highlightAll } from '../render/highlight.js';
import { applyEmojis } from '../features/emoji.js';
import { buildTOC } from '../features/toc.js';
import { toList, toCode, replaceSelection, getSelectionRanges } from '../features/insert.js';
import { TPL } from '../features/templates.js';
import { attachHistory } from '../state/history.js';
import { openWizard } from './wizard.js';
import { lintMarkdown } from '../utils/lint.js';
import { analisarRepo, proporPR } from '../github/fetch.js';
import { state, setAnalysis, setPR } from '../state/store.js';
import DiffMatchPatch from 'https://esm.sh/diff-match-patch';


function toast(msg, type = 'info') {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.className = `toast ${type}`;
  setTimeout(() => el.className = 'toast', 3000);
}


export function bindUI() {
  const mdEl = $('#md');
  const prev = $('#preview');
  const tabs = $$('.tab');
  const stats = $('#stats');
  const useEmoji = $('#useEmoji');
  const bakeEmoji = $('#bakeEmoji');
  const diffModal = $('#diff-modal');
  const diffView = $('#diff-view');
  $('#btn-voltar')?.addEventListener('click', () => { diffModal.hidden = true; });
  const landing = $('#landing');
  const app = $('#app');
  const btnCreate = $('#landing-create');
  const btnOpen = $('#landing-open');
  const defaultMd = `# Nome do Projeto\n\nBreve descrição…\n\n> [!TIP]\n> Use o painel à esquerda para inserir blocos prontos.\n`;

  function showLanding() { landing.hidden = false; app.hidden = true; }
  function hideLanding() { landing.hidden = true; app.hidden = false; }

  if (!mdEl.value.trim()) {
    showLanding();
  } else {
    hideLanding();
  }

  function countStats(s) {
    const noCode = s.replace(/```[\s\S]*?```/g, '');
    const words = (noCode.match(/[A-Za-zÀ-ÿ0-9_]+/g) || []).length;
    const heads = (noCode.match(/^#{1,6}\s/mg) || []).length;
    return `${words} palavras • ${heads} seções`;
  }

  function refreshPreview() {
    prev.innerHTML = mdToHtml(mdEl.value, { emojify: useEmoji?.checked });
    highlightAll(prev);
  }

  function update() {
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
  async function handleWizard() {
    try {
      const res = await openWizard();
      if (!res) return;
      const { installation_id, owner, repo, ref, readme_path, readme, base_sha } = res;
      Object.assign(state.inputs, { installation_id, owner, repo, ref, readme_path, base_sha });
      state.original_readme = readme;
      mdEl.value = readme;
      update();
      hideLanding();
      toast('README carregado ✅', 'ok');
    } catch (err) {
      console.error(err);
      const msg = err?.message === 'NETWORK_FAILURE' ? 'Falha de rede ao carregar README' : 'Falha ao carregar README';
      toast(msg, 'warn');
    }
  }

  $('#btn-connect')?.addEventListener('click', handleWizard);
  $('#landing-import')?.addEventListener('click', handleWizard);

  // analisar
  $('#btn-analisar')?.addEventListener('click', async () => {
    try {
      const { installation_id, owner, repo, ref, readme_path } = state.inputs;
      if (!installation_id || !owner || !repo) {
        toast('Selecione um repositório primeiro.', 'warn');
        return;
      }
      $('#btn-analisar').disabled = true;
      const data = await analisarRepo({ installation_id: Number(installation_id), owner, repo, ref, readme_path });
      setAnalysis(data);
      if (data?.base_sha) state.inputs.base_sha = data.base_sha;

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
      // diff entre original carregado e conteúdo atual
      const dmp = new DiffMatchPatch();
      const diff = dmp.diff_main(state.original_readme || '', mdEl.value);
      dmp.diff_cleanupSemantic(diff);
      if (diffView) diffView.innerHTML = dmp.diff_prettyHtml(diff);
      if (diffModal) diffModal.hidden = false;
      toast('Análise concluída ✅', 'ok');
    } catch (e) {
      console.error(e);
      if (e.message === 'NETWORK_FAILURE') toast('Falha de rede durante a análise', 'err');
      else toast('Falha na análise: ' + e.message, 'err');
    } finally {
      $('#btn-analisar').disabled = false;
    }
  });

  // propor PR
  $('#btn-pr-confirm')?.addEventListener('click', async () => {
    try {
      const { installation_id, owner, repo, ref, readme_path, message, base_sha } = state.inputs;
      if (!base_sha) { toast('Carregue um README primeiro.', 'warn'); return; }
      $('#btn-pr-confirm').disabled = true;
      const head = `readme-studio/update-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
      const pr = await proporPR({
        installation_id: Number(installation_id), owner, repo,
        base: ref || 'main', head, readme_path,
        message, base_sha,
        new_content_utf8: mdEl.value
      });
      setPR(pr);
      const link = $('#pr-link');
      link.href = pr.pr_url; link.textContent = 'Abrir PR';
      link.target = '_blank';
      toast('PR criado como draft 🚀', 'ok');
    } catch (e) {
      console.error(e);
      if (e.message === 'NETWORK_FAILURE') toast('Falha de rede ao criar PR', 'err');
      else toast('Falha ao criar PR: ' + e.message, 'err');
    } finally {
      $('#btn-pr-confirm').disabled = false;
      if (diffModal) diffModal.hidden = true;
    }
  });


  const history = attachHistory(mdEl, () => { update(); });
  $('#undo').onclick = () => history.undo();
  $('#redo').onclick = () => history.redo();

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
      const r = new FileReader(); r.onload = () => { mdEl.value = r.result; update(); hideLanding(); };
      r.readAsText(f);
    };
    inp.click();
  };

  $('#addBadge').onclick = () => {
    const L = $('#bLabel').value || 'badge';
    const M = $('#bMsg').value || 'ok';
    const C = ($('#bColor').value || 'blue').replace(/^#/, '');
    const G = $('#bLogo').value;
    const url = `https://img.shields.io/badge/${encodeURIComponent(L)}-${encodeURIComponent(M)}-${C}${G ? `?logo=${encodeURIComponent(G)}` : ''}`;
    replaceSelection(mdEl, `![${L}](${url}) `);
    update();
  };
  $('#addGHBadges').onclick = () => {
    const rr = ($('#ghRepo').value || '').trim();
    if (!rr || !rr.includes('/')) return alert('Use no formato owner/repo');
    const [o, r] = rr.split('/');
    const set = [
      `![stars](https://img.shields.io/github/stars/${o}/${r}?style=flat)`,
      `![forks](https://img.shields.io/github/forks/${o}/${r}?style=flat)`,
      `![issues](https://img.shields.io/github/issues/${o}/${r}?style=flat)`,
      `![license](https://img.shields.io/github/license/${o}/${r}?style=flat)`,
      `![last commit](https://img.shields.io/github/last-commit/${o}/${r}?style=flat)`
    ].join(' ');
    replaceSelection(mdEl, set + '\n'); update();
  };
  $('#addCode').onclick = () => { toCode(mdEl, $('#codeLang')?.value || ''); update(); };
  $('#toCode').onclick = () => { toCode(mdEl, $('#codeLang')?.value || ''); update(); };
  $('#toList').onclick = () => { toList(mdEl); update(); };
  $('#addCall').onclick = () => { const t = $('#callType').value || 'NOTE'; replaceSelection(mdEl, `\n> [!${t}]\n> Texto do aviso.\n`); update(); };
  $('#addDetails').onclick = () => { const s = $('#sumText').value || 'Mais detalhes'; replaceSelection(mdEl, `\n<details>\n<summary>${s}</summary>\n\nConteúdo oculto\n\n</details>\n`); update(); };
  $('#addTable').onclick = () => {
    const r = parseInt($('#rows').value || '2', 10), c = parseInt($('#cols').value || '3', 10);
    let md = '\n|'; for (let j = 0; j < c; j++) md += ` Col${j + 1} |`;
    md += '\n|' + Array(c).fill('---').join('|') + '|\n';
    for (let i = 0; i < r; i++) { md += '|'; for (let j = 0; j < c; j++) md += ' dado |'; md += '\n'; }
    replaceSelection(mdEl, md + '\n'); update();
  };
  $('#addMermaid').onclick = () => {
    const k = $('#mermKind').value;
    const ex = {
      flowchart: `\n\`\`\`mermaid\nflowchart TD\n  A[Start] --> B{Pergunta?}\n  B -- Sim --> C[Do it]\n  B -- Não --> D[Stop]\n\`\`\`\n`,
      sequence: `\n\`\`\`mermaid\nsequenceDiagram\n  participant U as Usuário\n  participant S as Sistema\n  U->>S: request\n  S-->>U: response\n\`\`\`\n`,
      gantt: `\n\`\`\`mermaid\n%%{init: {"theme": "neutral"}}%%\ngantt\n  title Roadmap\n  dateFormat  YYYY-MM-DD\n  section Core\n  Parser       :a1, 2025-08-01, 7d\n  UI           :after a1, 5d\n\`\`\`\n`,
      class: `\n\`\`\`mermaid\nclassDiagram\n  class Repo{\n    +string name\n    +clone()\n  }\n\`\`\`\n`
    }[k];
    replaceSelection(mdEl, ex || ''); update();
  };

  $('#addSection').onclick = () => {
    const sel = $('#section').value;
    const map = {
      'Header com Badges': `# Nome do Projeto\n\n[![build](https://img.shields.io/badge/build-passing-brightgreen)](#) [![license](https://img.shields.io/badge/license-MIT-blue)](#)\n\nBreve descrição do que o projeto faz.\n\n---\n`,
      'Resumo / Pitch': `## Resumo\nExplique o problema, a solução e o impacto em 3–4 linhas.\n`,
      'Instalação': `## Instalação\n\n\`\`\`bash\n# ex.:\nnpm i\n# ou\npip install pacote\n\`\`\`\n`,
      'Uso': `## Uso\n\n\`\`\`bash\ncomando --help\n\`\`\`\n`,
      'Exemplos': `## Exemplos\n- Exemplo 1\n- Exemplo 2\n`,
      'Screenshots': `## Screenshots\n\n![Descrição](imgs/screenshot1.png)\n`,
      'Roadmap': `## Roadmap\n- [ ] Item 1\n- [ ] Item 2\n`,
      'Contribuindo': `## Contribuindo\nPRs são bem-vindos. Para mudanças maiores, abra uma issue.\n`,
      'Licença (MIT)': `## Licença\nMIT © Seu Nome\n`,
      'TOC (sumário)': `## Sumário\n<!-- o botão TOC automático gera a lista aqui -->\n`
    };
    let block = map[sel] || '';
    if (block) { replaceSelection(mdEl, '\n' + block + '\n'); update(); }
  };

  // Gera template por stack
  $('#gen').onclick = () => {
    const s = $('#stack').value;
    log('Gen template stack=', s);
    if (!s) return alert('Escolha uma stack');
    if (!TPL[s]) return alert('Template não encontrado para ' + s);
    let md = TPL[s];
    if (useEmoji?.checked) {
      md = applyEmojis(md, true);
    }
    mdEl.value = md; update();
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

  function renderLint(res) {
    const panel = $('#lintPanel');
    const list = $('#lintList');
    const sum = $('#lintSummary');
    list.innerHTML = '';
    let errs = 0, warns = 0;
    res.issues.forEach(it => { if (it.sev === 'err') errs++; else if (it.sev === 'warn') warns++; });
    sum.textContent = `Erros: ${errs} • Avisos: ${warns} • Itens: ${res.issues.length}`;
    res.issues.forEach(it => {
      const li = document.createElement('li');
      li.className = it.sev;
      li.textContent = (it.line ? `L${it.line}: ` : '') + it.msg;
      list.appendChild(li);
    });
    panel.hidden = false;
  }
  $('#lint').onclick = () => {
    const res = lintMarkdown(mdEl.value);
    renderLint(res);
  };

  btnCreate?.addEventListener('click', () => {
    hideLanding();
    mdEl.value = defaultMd;
    update();
  });

  btnOpen?.addEventListener('click', () => {
    hideLanding();
    $('#open').click();
  });

  update();
}
