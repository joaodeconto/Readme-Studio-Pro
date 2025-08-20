export function parseHeadings(md) {
  const lines = md.split(/\r?\n/);
  const heads = [];
  const re = /^(#{1,6})\s+(.*)$/;
  for (const line of lines) {
    const m = line.match(re);
    if (m) {
      const level = m[1].length;
      // remove possíveis anchors inline tipo <a id="..."></a> (raro em READMEs)
      const text = m[2].replace(/<a[^>]*>(.*?)<\/a>/gi, "$1").trim();
      const slug = githubSlugify(text);
      heads.push({ level, text, slug });
    }
  }
  return heads;
}