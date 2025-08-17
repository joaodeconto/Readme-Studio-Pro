import { $, $$ } from '../utils/dom.js';
import { log } from '../utils/log.js';
import { mdToHtml } from '../render/markdown.js';
import { highlightAll } from '../render/highlight.js';
import { applyEmojis } from '../features/emoji.js';
import { buildTOC } from '../features/toc.js';
import { toList, toCode, replaceSelection } from '../features/insert.js';
import { fetchReadme, parseRepoSpec } from '../github/fetch.js';
import { TPL } from '../features/templates.js';
import { store } from '../state/store.js';

// Vincula handlers aos elementos da interface
export function bindUI() {
  const mdEl = $('#md');
  const prev = $('#preview');
  const tabs = $$('.tab');
  const stats = $('#stats');
  const useEmoji = $('#useEmoji');
  const bakeEmoji = $('#bakeEmoji');
  const fetchBtn = $('#fetchGH');

  function countStats(s) {
    const noCode = s.replace(/```[\s\S]*?```/g, '');
    const words=(noCode.match(/[A-Za-zÀ-ÿ0-9_]+/g)||[]).length;
    const heads=(noCode.match(/^#{1,6}\s/mg)||[]).length;
    return `${words} palavras • ${heads} seções`;
  }

  function update() {
    stats.textContent = countStats(mdEl.value);
    store.text = mdEl.value;
    if (!mdEl.hidden) return;
    prev.innerHTML = mdToHtml(mdEl.value, { emojify: useEmoji?.checked });
    highlightAll(prev);
  }

  tabs.forEach(t=>t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.dataset.active = (x===t));
    const edit = t.dataset.tab==='edit';
    mdEl.hidden=!edit; prev.hidden=edit;
    if (!edit) update();
  }));

  // Operações de arquivo
  $('#new').onclick = () => { if (confirm('Limpar conteúdo?')) { mdEl.value=''; update(); } };
  $('#save').onclick = () => {
    const out = bakeEmoji ? applyEmojis(mdEl.value, true) : mdEl.value;
    const a=document.createElement('a');
    a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(out);
    a.download='README.md'; 
    a.click();
  };
  $('#copy').onclick = () => {
    const out = bakeEmoji ? applyEmojis(mdEl.value, true) : mdEl.value;
    navigator.clipboard.writeText(out);
  };

  $('#open').onclick = () => {
    const inp=document.createElement('input'); inp.type='file'; inp.accept='.md,text/markdown,text/plain';
    inp.onchange = () => {
      const f=inp.files[0]; if(!f) return;
      const r=new FileReader(); r.onload=()=>{ mdEl.value=r.result; update(); };
      r.readAsText(f);
    };
    inp.click();
  };

  // Inserções de badges
  $('#addBadge').onclick = () => {
    const L=$('#bLabel').value||'badge';
    const M=$('#bMsg').value||'ok';
    const C=($('#bColor').value||'blue').replace(/^#/, '');
    const G=$('#bLogo').value;
    const url=`https://img.shields.io/badge/${encodeURIComponent(L)}-${encodeURIComponent(M)}-${C}${G?`?logo=${encodeURIComponent(G)}`:''}`;
    replaceSelection(mdEl, `![${L}](${url}) `);
    update();
  };

  $('#addGHBadges').onclick = () => {
    const rr=($('#ghRepo').value||'').trim();
    if (!rr || !rr.includes('/')) return alert('Use no formato owner/repo');
    const [o,r]=rr.split('/');
    const set=[
      `![stars](https://img.shields.io/github/stars/${o}/${r}?style=flat)`,
      `![forks](https://img.shields.io/github/forks/${o}/${r}?style=flat)`,
      `![issues](https://img.shields.io/github/issues/${o}/${r}?style=flat)`,
      `![license](https://img.shields.io/github/license/${o}/${r}?style=flat)`,
      `![last commit](https://img.shields.io/github/last-commit/${o}/${r}?style=flat)`
    ].join(' ');
    replaceSelection(mdEl, set+'\n'); update();
  };

  $('#addCode').onclick = () => {
    const lang=$('#codeLang')?.value||'';
    toCode(mdEl, lang); update();
  };
  $('#toCode').onclick = () => { toCode(mdEl, $('#codeLang')?.value||''); update(); };
  $('#toList').onclick = () => { toList(mdEl); update(); };

  // Callout
  $('#addCall').onclick = () => {
    const t=$('#callType').value||'NOTE';
    replaceSelection(mdEl, `\n> [!${t}]\n> Texto do aviso.\n`); update();
  };
  // Colapsável
  $('#addDetails').onclick = () => {
    const s=$('#sumText').value||'Mais detalhes';
    replaceSelection(mdEl, `\n<details>\n<summary>${s}</summary>\n\nConteúdo oculto\n\n</details>\n`); update();
  };
  // Tabela
  $('#addTable').onclick = () => {
    const r=parseInt($('#rows').value||'2',10), c=parseInt($('#cols').value||'3',10);
    let md='\n|'; for(let j=0;j<c;j++) md+=` Col${j+1} |`;
    md+='\n|' + Array(c).fill('---').join('|') + '|\n';
    for(let i=0;i<r;i++){ md+='|'; for(let j=0;j<c;j++) md+=' dado |'; md+='\n'; }
    replaceSelection(mdEl, md+'\n'); update();
  };
  // Mermaid
  $('#addMermaid').onclick = () => {
    const k = $('#mermKind').value;
    const ex = {
      flowchart: `\n\`\`\`mermaid\nflowchart TD\n  A[Start] --> B{Pergunta?}\n  B -- Sim --> C[Do it]\n  B -- Não --> D[Stop]\n\`\`\`\n`,
      sequence: `\n\`\`\`mermaid\nsequenceDiagram\n  participant U as Usuário\n  participant S as Sistema\n  U->>S: request\n  S-->>U: response\n\`\`\`\n`,
      gantt: `\n\`\`\`mermaid\n%%{init: {"theme": "neutral"}}%%\ngantt\n  title Roadmap\n  dateFormat  YYYY-MM-DD\n  section Core\n  Parser       :a1, 2025-08-01, 7d\n  UI           :after a1, 5d\n\`\`\`\n`,
      class: `\n\`\`\`mermaid\nclassDiagram\n  class Repo{\n    +string name\n    +clone()\n  }\n\`\`\`\n`
    }[k];
    replaceSelection(mdEl, ex||''); update();
  };

  // Inserção de seções padrão com emoji opcional
  $('#addSection').onclick = () => {
    const sel=$('#section').value;
    const map = {
      'Header com Badges': `# Nome do Projeto\n\n[![build](https://img.shields.io/badge/build-passing-brightgreen)](#) [![license](https://img.shields.io/badge/license-MIT-blue)](#)\n\nBreve descrição do que o projeto faz.\n\n---\n`,
      'Resumo / Pitch': `## Resumo\nExplique o problema, a solução e o impacto em 3–4 linhas.\n`,
      'Instalação': `## Instalação\n\n\`\`\`bash\n# ex.:\nnpm i\n# ou\npip install pacote\n\`\`\`\n`,
      'Uso': `## Uso\n\n\`\`\`bash\ncomando --help\n\`\`\`\n`,
      'Exemplos': `## Exemplos\n- Exemplo 1\n- Exemplo 2\n`,
      'Screenshots': `## Screenshots\n\n![Descrição](imgs/screenshot1.png)\n`,
      'Roadmap': `## Roadmap\n- [ ] Item 1\n- [ ] Item 2\n`,
      'Contribuindo': `## Contribuindo\nPRs são bem-vindos. Para mudanças maiores, abra uma issue para discutir o que você gostaria de alterar.\n`,
      'Licença (MIT)': `## Licença\nMIT © Seu Nome\n`,
      'TOC (sumário)': `## Sumário\n<!-- o botão TOC automático gera a lista aqui -->\n`
    };
    let block = map[sel] || '';
    if (block) {
      if ($('#useEmoji')?.checked) {
        block = applyEmojis(block, true);
      }
      replaceSelection(mdEl, '\n'+block+'\n'); update();
    }
  };

  // Gera sumário automaticamente
  $('#tocAuto').addEventListener('click', ()=>{
    const toc = buildTOC(mdEl.value, { useEmoji: $('#useEmoji')?.checked });
    if (!toc) return alert('Nenhum heading encontrado');
    replaceSelection(mdEl, `\n## Sumário\n${toc}\n`);
    update();
  });

  // Gera template por stack
  $('#gen').onclick = () => {
    const s=$('#stack').value;
    log('Gen template stack=', s);
    if (!s) return alert('Escolha uma stack');
    if (!TPL[s]) return alert('Template não encontrado para '+s);
    let md = TPL[s];
    if (useEmoji?.checked) {
      md = applyEmojis(md, true);
    }
    mdEl.value = md; update();
  };

  // Lê README do GitHub ou caminho RAW
  fetchBtn?.addEventListener('click', async ()=>{
    const specStr = ($('#ghInput').value||'').trim();
    if (!specStr) return alert('Cole owner/repo, URL do repositório ou RAW do README');
    const old=fetchBtn.textContent; fetchBtn.textContent='Lendo…'; fetchBtn.disabled=true;
    try{
      const spec=parseRepoSpec(specStr);
      log('parse spec', specStr, spec);
      const txt = await fetchReadme(spec, { forceRaw: !!$('#forceRaw')?.checked });
      if (!txt?.trim()) throw new Error('README vazio ou não encontrado');
      mdEl.value = txt; update();
      log('README carregado. tamanho=', txt.length);
    }catch(err){
      console.error(err); log('Erro', err?.message||String(err));
      alert('Não consegui ler o README: '+(err?.message||err));
    }finally{
      fetchBtn.textContent=old; fetchBtn.disabled=false;
    }
  });

  // Alterna exibição do painel de debug
  $('#showDbg')?.addEventListener('change', ()=>{
    const panel=$('#dbgPanel');
    if (!panel) return;
    panel.hidden = !$('#showDbg').checked;
  });

  // Inicialização do conteúdo
  mdEl.value = store.text;
  update();
}