import { $, $$ } from '../utils/dom.js';
import { log } from '../utils/log.js';
import { applyEmojis } from '../features/emoji.js';
import { buildTOC } from '../features/toc.js';
import { toList, toCode, replaceSelection, getSelectionRanges } from '../features/insert.js';
import { TPL } from '../features/templates.js';
import { attachHistory } from '../state/history.js';
import { lintMarkdown } from '../utils/lint.js';
import { countStats, buildBadgeUrl, generateGithubBadges, refreshPreview, renderLint } from './markdownOps.js';
import { handleWizard, analyzeRepository, previewDiff, confirmPR } from './githubActions.js';

function toast(msg: string, type: string = 'info'): void {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast ${type}`;
  setTimeout(() => (el.className = 'toast'), 3000);
}

export function bindUI(): void {
  const mdEl = $('#md') as HTMLTextAreaElement;
  const prev = $('#preview') as HTMLElement;
  const tabs = $$('.tab');
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
  let step = 1;

  function setStep(n: number): void {
    step = n;
    stepConnect.hidden = n !== 1;
    app.hidden = n === 1;
    if (diffModal) diffModal.hidden = n !== 3;
    if (btnAnalisar) btnAnalisar.disabled = n !== 2;
    if (btnPreview) btnPreview.disabled = n !== 2 || !analysisReady;
    if (btnPrConfirm) btnPrConfirm.disabled = n !== 3;
  }

  $('#btn-voltar')?.addEventListener('click', () => {
    setStep(2);
  });
  setStep(1);

  function update(): void {
    stats.textContent = countStats(mdEl.value);
    if (!mdEl.hidden) return;
    refreshPreview(mdEl.value, prev, useEmoji?.checked);
  }

  tabs.forEach(t =>
    t.addEventListener('click', () => {
      tabs.forEach(x => (x.dataset.active = x === t));
      const edit = t.dataset.tab === 'edit';
      mdEl.hidden = !edit;
      prev.hidden = edit;
      if (!edit) update();
    })
  );

  $('#btn-connect')?.addEventListener('click', () =>
    handleWizard(mdEl, update, setStep, btnPreview, toast)
  );

  $('#btn-demo')?.addEventListener('click', () => {
    mdEl.value = '# Projeto Demo\n\nComece a escrever o README aqui...';
    update();
    setStep(2);
    toast('Modo demo iniciado ✅', 'ok');
  });

  $('#btn-analisar')?.addEventListener('click', async () => {
    if (!btnAnalisar) return;
    analysisReady = await analyzeRepository(btnAnalisar, btnPreview, mdEl, toast);
  });

  $('#btn-preview')?.addEventListener('click', () => {
    previewDiff(diffView, mdEl, setStep);
  });

  $('#btn-pr-confirm')?.addEventListener('click', () => {
    if (btnPrConfirm) confirmPR(btnPrConfirm, mdEl, setStep, toast);
  });

  const history = attachHistory(mdEl, () => {
    update();
  });
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
      let s = v.lastIndexOf('\n', sel.start - 1) + 1;
      if (s < 0) s = 0;
      let e = v.indexOf('\n', sel.start);
      if (e < 0) e = v.length;
      text = v.slice(s, e);
      mdEl.selectionStart = s;
      mdEl.selectionEnd = e;
    }
    const lines = text.split(/\r?\n/).map(l => (l ? '# ' + l.replace(/^#+\s*/, '') : l));
    replaceSelection(mdEl, lines.join('\n'));
    update();
  };

  $('#new').onclick = () => {
    if (confirm('Limpar conteúdo?')) {
      mdEl.value = '';
      update();
    }
  };

  $('#save').onclick = () => {
    const bake = bakeEmoji?.checked;
    const out = bake ? applyEmojis(mdEl.value, true) : mdEl.value;
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(out);
    a.download = 'README.md';
    a.click();
  };

  $('#copy').onclick = () => {
    const bake = bakeEmoji?.checked;
    const out = bake ? applyEmojis(mdEl.value, true) : mdEl.value;
    navigator.clipboard.writeText(out);
  };

  $('#open').onclick = () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.md,text/markdown,text/plain';
    inp.onchange = () => {
      const f = inp.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        mdEl.value = r.result as string;
        update();
        setStep(2);
      };
      r.readAsText(f);
    };
    inp.click();
  };

  $('#addBadge').onclick = () => {
    const L = ($('#bLabel').value as string) || 'badge';
    const M = ($('#bMsg').value as string) || 'ok';
    const C = ((($('#bColor').value as string) || 'blue').replace(/^#/, ''));
    const G = $('#bLogo').value as string;
    const url = buildBadgeUrl(L, M, C, G);
    replaceSelection(mdEl, `![${L}](${url}) `);
    update();
  };

  $('#addGHBadges').onclick = () => {
    const rr = ($('#ghRepo').value as string || '').trim();
    if (!rr || !rr.includes('/')) return alert('Use no formato owner/repo');
    const [o, r] = rr.split('/');
    const set = generateGithubBadges(o, r);
    replaceSelection(mdEl, set + '\n');
    update();
  };

  $('#addCode').onclick = () => {
    toCode(mdEl, ($('#codeLang') as HTMLInputElement | null)?.value || '');
    update();
  };
  $('#toCode').onclick = () => {
    toCode(mdEl, ($('#codeLang') as HTMLInputElement | null)?.value || '');
    update();
  };
  $('#toList').onclick = () => {
    toList(mdEl);
    update();
  };
  $('#addCall').onclick = () => {
    const t = ($('#callType').value as string) || 'NOTE';
    replaceSelection(mdEl, `\n> [!${t}]\n> Texto do aviso.\n`);
    update();
  };
  $('#addDetails').onclick = () => {
    const s = ($('#sumText').value as string) || 'Mais detalhes';
    replaceSelection(mdEl, `\n<details>\n<summary>${s}</summary>\n\nConteúdo oculto\n\n</details>\n`);
    update();
  };
  $('#addTable').onclick = () => {
    const r = parseInt((($('#rows').value as string) || '2'), 10);
    const c = parseInt((($('#cols').value as string) || '3'), 10);
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
  $('#addMermaid').onclick = () => {
    const k = ($('#mermKind').value as string);
    const ex: Record<string, string> = {
      flowchart:
        `\n\`\`\`mermaid\nflowchart TD\n  A[Start] --> B{Pergunta?}\n  B -- Sim --> C[Do it]\n  B -- Não --> D[Stop]\n\`\`\`\n`,
      sequence:
        `\n\`\`\`mermaid\nsequenceDiagram\n  participant U as Usuário\n  participant S as Sistema\n  U->>S: request\n  S-->>U: response\n\`\`\`\n`,
      gantt:
        `\n\`\`\`mermaid\n%%{init: {"theme": "neutral"}}%%\ngantt\n  title Roadmap\n  dateFormat  YYYY-MM-DD\n  section Core\n  Parser       :a1, 2025-08-01, 7d\n  UI           :after a1, 5d\n\`\`\`\n`,
      class:
        `\n\`\`\`mermaid\nclassDiagram\n  class Repo{\n    +string name\n    +clone()\n  }\n\`\`\`\n`
    };
    replaceSelection(mdEl, ex[k] || '');
    update();
  };

  $('#addSection').onclick = () => {
    const sel = ($('#section').value as string);
    const map: Record<string, string> = {
      'Header com Badges':
        `# Nome do Projeto\n\n[![build](https://img.shields.io/badge/build-passing-brightgreen)](#) [![license](https://img.shields.io/badge/license-MIT-blue)](#)\n\nBreve descrição do que o projeto faz.\n\n---\n`,
      'Resumo / Pitch': `## Resumo\nExplique o problema, a solução e o impacto em 3–4 linhas.\n`,
      'Instalação':
        `## Instalação\n\n\`\`\`bash\n# ex.:\nnpm i\n# ou\npip install pacote\n\`\`\`\n`,
      'Uso': `## Uso\n\n\`\`\`bash\ncomando --help\n\`\`\`\n`,
      'Exemplos': `## Exemplos\n- Exemplo 1\n- Exemplo 2\n`,
      'Screenshots': `## Screenshots\n\n![Descrição](imgs/screenshot1.png)\n`,
      'Roadmap': `## Roadmap\n- [ ] Item 1\n- [ ] Item 2\n`,
      'Contribuindo': `## Contribuindo\nPRs são bem-vindos. Para mudanças maiores, abra uma issue.\n`,
      'Licença (MIT)': `## Licença\nMIT © Seu Nome\n`,
      'TOC (sumário)': `## Sumário\n<!-- o botão TOC automático gera a lista aqui -->\n`
    };
    const block = map[sel] || '';
    if (block) {
      replaceSelection(mdEl, '\n' + block + '\n');
      update();
    }
  };

  $('#gen').onclick = () => {
    const s = ($('#stack').value as string);
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
    if (e.ctrlKey && !e.shiftKey && k === 'b') {
      e.preventDefault();
      $('#bold').click();
    } else if (e.ctrlKey && !e.shiftKey && k === 'h') {
      e.preventDefault();
      $('#heading').click();
    } else if (e.ctrlKey && !e.shiftKey && k === 'l') {
      e.preventDefault();
      $('#toList').click();
    } else if (e.ctrlKey && e.shiftKey && k === 'c') {
      e.preventDefault();
      $('#toCode').click();
    } else if (e.ctrlKey && !e.shiftKey && k === 't') {
      e.preventDefault();
      $('#tocAuto').click();
    } else if (e.ctrlKey && !e.shiftKey && k === 'm') {
      e.preventDefault();
      $('#toggleAdv').click();
    }
  });

  $('#lint').onclick = () => {
    const res = lintMarkdown(mdEl.value);
    const panel = $('#lintPanel') as HTMLElement;
    const list = $('#lintList') as HTMLElement;
    const sum = $('#lintSummary') as HTMLElement;
    renderLint(res, panel, list, sum);
  };

  update();
}
