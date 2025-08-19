export function slug(t = '') {
  return t.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2190-\u2BFF\u2600-\u27BF\u{1F000}-\u{1FAFF}]/gu, '')
    .replace(/[^a-z0-9 -]/g, '')
    .trim().replace(/ +/g, '-');
}

export function githubSlugify(str) {
  return str
    .trim()
    .toLowerCase()
    // normaliza acentos
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // remove pontuação comum
    .replace(/[*+~./()'"`!?,:;<>{}\[\]\\|@#$%^&=]/g, "")
    // substitui espaços por hifens
    .replace(/\s+/g, "-")
    // colapsa hifens
    .replace(/-+/g, "-")
    // remove hifens nas pontas
    .replace(/^-|-$/g, "");
}