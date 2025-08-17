import { slug } from '../utils/slug.js';

// Gera um sumário (TOC) com indentação baseada no nível de heading
export function buildTOC(md, { useEmoji=false } = {}) {
  const withoutCode = md.replace(/```[^]*?```/g, '');
  const lines = withoutCode.split('\n');
  const EMO = { 'instalação':'⚙️','uso':'🚀','exemplos':'🧪','screenshots':'🖼️','roadmap':'🗺️','contribuindo':'🤝','licença':'📄','sumário':'🧭','readme':'📦','introdução':'📝' };
  const startsWithEmoji = s => /^[\u2190-\u2BFF\u2600-\u27BF\u{1F000}-\u{1FAFF}]/u.test((s||'').trim());
  const items=[];
  for (const ln of lines) {
    const m=ln.match(/^(#{1,6})\s+(.+)/);
    if (!m) continue;
    const level=m[1].length;
    const rawTitle=m[2].trim();
    const title = (!useEmoji || startsWithEmoji(rawTitle)) ? rawTitle
      : (()=>{ const t=rawTitle.toLowerCase(); for (const k in EMO){ if(t.includes(k)) return `${EMO[k]} ${rawTitle}`; } return rawTitle; })();
    items.push({ level, title, anchor: slug(rawTitle) });
  }
  if (!items.length) return '';
  const base = Math.min(...items.map(i=>i.level));
  return items.map(i=>'  '.repeat(i.level-base)+`- [${i.title}](#${i.anchor})`).join('\n');
}