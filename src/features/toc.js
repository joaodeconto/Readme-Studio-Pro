import { githubSlugify as slug } from '../utils/githubSlug.js'; // use este slug (compatível com GitHub)
import { emojifyTitle } from '../features/emoji.js';

// Gera TOC; quando useEmoji=true, força ícone em todo item.
export function buildTOC(md, { useEmoji = false } = {}) {
  const withoutCode = md.replace(/```[^]*?```/g, '');
  const lines = withoutCode.split('\n');
  const items = [];

  for (const ln of lines) {
    const m = ln.match(/^(#{1,6})\s+(.+)/);
    if (!m) continue;

    const level = m[1].length;
    const rawTitle = m[2].trim();

    // ✅ nome consistente
    const titleShown = useEmoji ? emojifyTitle(rawTitle, level, true) : rawTitle;

    // slug SEM emoji (como o GitHub faz)
    items.push({ level, title: titleShown, anchor: slug(rawTitle) });
  }

  if (!items.length) return '';
  const base = Math.min(...items.map(i => i.level));
  return items
    .map(i => `${'  '.repeat(i.level - base)}- [${i.title}](#${i.anchor})`)
    .join('\n');
}
