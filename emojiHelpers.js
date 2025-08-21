const EMO = {
  'Header com Badges': '🏷️',
  'Resumo': '📝',
  'Instalação': '⚙️',
  'Uso': '🚀',
  'Exemplos': '🧪',
  'Screenshots': '🖼️',
  'Roadmap': '🗺️',
  'Contribuindo': '🤝',
  'Licença': '📄',
  'Sumário': '🧭',
  'Nome do Projeto': '📦'
};

function startsWithEmoji(s) {
  try {
    return /^[\u2190-\u2BFF\u2600-\u27BF\u{1F000}-\u{1FAFF}]/u.test((s || '').trim());
  } catch {
    return false;
  }
}

function emojifyLine(hashes, title) {
  if (!globalThis.useEmoji?.checked) return `${hashes} ${title}`;
  if (startsWithEmoji(title)) return `${hashes} ${title}`;
  const t = title.trim();
  const exact = EMO[t] || EMO[t.replace(/:.*/, '')];
  if (exact) return `${hashes} ${exact} ${title}`;
  for (const k in EMO) {
    if (t.toLowerCase().includes(k.toLowerCase())) return `${hashes} ${EMO[k]} ${title}`;
  }
  return `${hashes} ${title}`;
}

function applyEmojis(md) {
  return md.replace(/^(#{1,6})\s+([^\n]+)$/gm, (m, hashes, title) => emojifyLine(hashes, title));
}

module.exports = { EMO, startsWithEmoji, emojifyLine, applyEmojis };
