import { githubSlugify as slug } from '../utils/githubSlug';
import { emojifyTitle } from './emoji';

export interface TOCItem {
  level: number;
  title: string;
  anchor: string;
}

export function buildTOC(md: string, { useEmoji = false }: { useEmoji?: boolean } = {}): string {
  const withoutCode = md.replace(/```[^]*?```/g, '');
  const lines = withoutCode.split('\n');
  const items: TOCItem[] = [];
  for (const ln of lines) {
    const m = ln.match(/^(#{1,6})\s+(.+)/);
    if (!m) continue;
    const level = m[1].length;
    const rawTitle = m[2].trim();
    const titleShown = useEmoji ? emojifyTitle(rawTitle, level, true) : rawTitle;
    items.push({ level, title: titleShown, anchor: slug(rawTitle) });
  }
  if (!items.length) return '';
  const base = Math.min(...items.map((i) => i.level));
  return items.map((i) => `${'  '.repeat(i.level - base)}- [${i.title}](#${i.anchor})`).join('\n');
}
