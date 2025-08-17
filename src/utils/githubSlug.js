export function githubSlugify(text = '') {
  return text
    .toLowerCase()
    // remove acentos
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2190-\u2BFF\u2600-\u27BF\u{1F000}-\u{1FAFF}]/gu, '')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
