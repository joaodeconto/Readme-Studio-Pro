export function injectTOC(md: string): string {
  const cleaned = md.replace(/<!--toc:start-->[\s\S]*?<!--toc:end-->/g, '');
  const headings = cleaned.split('\n').filter((l) => /^#{1,6}\s/.test(l));
  const toc = headings
    .map((h) => {
      const level = (h.match(/^#+/)?.[0].length) || 1;
      const title = h.replace(/^#{1,6}\s*/, '');
      const id = title.toLowerCase().replace(/[^\w]+/g, '-');
      return `${'  '.repeat(level - 1)}- [${title}](#${id})`;
    })
    .join('\n');
  return `<!--toc:start-->\n## Sumário\n${toc}\n<!--toc:end-->\n\n${cleaned}`;
}

export function sprinkleEmojis(md: string): string {
  if (md.includes('<!--emoji:applied-->')) return md;
  return `<!--emoji:applied-->\n${md}`;
}