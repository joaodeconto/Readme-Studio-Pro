// Aplicação de emojis em headings de markdown (centralizado)
export const EMO_MAP = [
  // pt / en comuns
  [/^(readme|introdução|introducao|overview|sobre)/i, "📝"],
  [/(objetivos|goals|purpose)/i, "🎯"],
  [/(funcionalidades|features)/i, "✨"],
  [/(stack|tecnologias|tech\s*stack)/i, "🧩"],
  [/(pré-?requisitos|requisitos|prereq|requirements)/i, "📦"],
  [/(instala(ç|c)ão|installation|setup)/i, "⚙️"],
  [/(configura(ç|c)ão|configuration|settings|env)/i, "🧭"],
  [/(uso|getting\s*started|how\s*to\s*use|run)/i, "🚀"],
  [/(exemplos|examples|demo|tutorial)/i, "🧪"],
  [/(api|endpoints|swagger|docs)/i, "📚"],
  [/(arquitetura|architecture|design)/i, "🏗️"],
  [/(banco\s*de\s*dados|database|db|migrations)/i, "🗄️"],
  [/(testes|tests|qa|coverage|ci)/i, "🧪"],
  [/(build|compila(ç|c)ão|bundle)/i, "🛠️"],
  [/(deploy|deployment|docker|kubernetes|k8s|release)/i, "🚢"],
  [/(segurança|security)/i, "🔒"],
  [/(performance|benchmark)/i, "⚡"],
  [/(roadmap|planejamento|timeline)/i, "🗺️"],
  [/(changelog|mudan(ç|c)as|releases|versionamento)/i, "🗒️"],
  [/(contribuindo|contribution|contributing|contributors)/i, "🤝"],
  [/(suporte|support|contato|contact|issues|bug)/i, "🛎️"],
  [/(faq|perguntas\s*freq)/i, "❓"],
  [/(licen(ç|c)a|license)/i, "📄"],
  [/(refer(ê|e)ncias|links|credits|acknowledg)/i, "🔗"],
  [/(screenshots?|imagens|gallery)/i, "🖼️"],
  [/(scripts|comandos|commands|cli)/i, "⌨️"],
];

export function startsWithEmoji(s) {
  try { return /^[\u2190-\u2BFF\u2600-\u27BF\u{1F000}-\u{1FAFF}]/u.test((s||'').trim()); }
  catch { return false; }
}

function fallbackByLevel(level) {
  if (level === 1) return "📦";
  if (level === 2) return "🧭";
  return "📄";
}

/** Decide o emoji para um título. Se force=true, garante algum emoji (via fallback). */
export function emojifyTitle(title, level=2, force=false) {
  if (startsWithEmoji(title)) return title;            // já tem
  for (const [re, emo] of EMO_MAP) {
    if (re.test(title)) return `${emo} ${title}`;
  }
  return force ? `${fallbackByLevel(level)} ${title}` : title;
}

/** Aplica emojis em headings do markdown em-linha (opcional). */
export function applyEmojis(md, enabled) {
  if (!enabled) return md;
  // h1…h6 com fallback forçado
  md = md.replace(/^######\s+(.+)$/gm, (m,t)=>`###### ${emojifyTitle(t, 6, true)}`);
  md = md.replace(/^#####\s+(.+)$/gm,  (m,t)=>`##### ${emojifyTitle(t, 5, true)}`);
  md = md.replace(/^####\s+(.+)$/gm,   (m,t)=>`#### ${emojifyTitle(t, 4, true)}`);
  md = md.replace(/^###\s+(.+)$/gm,    (m,t)=>`### ${emojifyTitle(t, 3, true)}`);
  md = md.replace(/^##\s+(.+)$/gm,     (m,t)=>`## ${emojifyTitle(t, 2, true)}`);
  md = md.replace(/^#\s+(.+)$/gm,      (m,t)=>`# ${emojifyTitle(t, 1, true)}`);
  return md;
}
