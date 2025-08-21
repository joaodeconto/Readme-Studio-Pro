export function buildTOC(heads, { minLevel = 1, maxLevel = 3 } = {}) {
  const filtered = heads.filter(h => h.level >= minLevel && h.level <= maxLevel);
  if (!filtered.length) return "";
  const base = Math.min(...filtered.map(h => h.level));
  return filtered
    .map(h => {
      const indent = "  ".repeat(h.level - base);
      return `${indent}- [${h.text}](#${h.slug})`;
    })
    .join("\n");
}

// Envolve TOC com bloco idempotente
export function wrapTOC(toc) {
  return [
    "<!-- readme-studio:toc:start -->",
    toc || "_(sem seções elegíveis para TOC)_",
    "<!-- readme-studio:toc:end -->"
  ].join("\n");
}

// Aplica (insere/substitui) TOC de forma idempotente
export function applyTOCBlock(md, tocBlock, { position = "top" } = {}) {
  const reBlock = /<!--\s*readme-studio:toc:start\s*-->[\s\S]*?<!--\s*readme-studio:toc:end\s*-->/i;
  if (reBlock.test(md)) {
    return md.replace(reBlock, tocBlock);
  }
  // sem bloco anterior → inserir
  if (position === "top") {
    // após o primeiro heading (corrente mais comum para README)
    const m = md.match(/^(# .*\n)/);
    if (m) {
      const idx = m.index + m[0].length;
      return md.slice(0, idx) + "\n" + tocBlock + "\n\n" + md.slice(idx);
    }
    // fallback: início do arquivo
    return tocBlock + "\n\n" + md;
  }
  // outras posições poderiam ser implementadas (ex.: após badges)
  return tocBlock + "\n\n" + md;
}
