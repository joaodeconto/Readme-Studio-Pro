export function githubSlugify(text='') {
  return text
    .toLowerCase()
    // remove emoji e símbolos
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2190-\u2BFF\u2600-\u27BF\u{1F000}-\u{1FAFF}]/gu, '')
    // remove tudo que não é alfanum/space/hyphen
    .replace(/[^a-z0-9 -]/g, '')
    // espaços -> hífen
    .trim().replace(/\s+/g, '-')
    // colapsa múltiplos hífens
    .replace(/-+/g, '-');
}