import { slug } from '../utils/slug.js';
import { emojifyTitle } from '../features/emoji.js';

// Gera TOC; quando useEmoji=true, força ícone em todo item.
export function buildTOC(md, { useEmoji=false } = {}) {
  const withoutCode = md.replace(/```[^]*?```/g, '');
  const lines = withoutCode.split('\n');
  const items = [];

  for (const ln of lines) {
    const m = ln.match(/^(#{1,6})\s+(.+)/);
    if (!m) continue;
    const level = m[1].length;
    const rawTitle = m[2].trim();
    const show = useEmoji ? emojifyTitle(rawTitle, level, true) : rawTitle;
    items.push({ level, title: show, anchor: slug(rawTitle) });
  }
  if (!items.length) return '';
  const base = Math.min(...items.map(i => i.level));
  return items.map(i => '  '.repeat(i.level - base) + `- [${i.title}](#${i.anchor})`).join('\n');
}
