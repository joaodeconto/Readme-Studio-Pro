export function githubSlugify(str: string): string {
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
