import { mdToHtml } from '../render/markdown.js';

export function countStats(s: string): string {
  const noCode = s.replace(/```[\s\S]*?```/g, '');
  const words = (noCode.match(/[A-Za-zÀ-ÿ0-9_]+/g) || []).length;
  const heads = (noCode.match(/^#{1,6}\s/mg) || []).length;
  return `${words} palavras • ${heads} seções`;
}

export function buildBadgeUrl(label: string, message: string, color: string, logo?: string): string {
  const base = `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color.replace(/^#/, '')}`;
  return logo ? `${base}?logo=${encodeURIComponent(logo)}` : base;
}

export function generateGithubBadges(owner: string, repo: string): string {
  const set = [
    `![stars](https://img.shields.io/github/stars/${owner}/${repo}?style=flat)`,
    `![forks](https://img.shields.io/github/forks/${owner}/${repo}?style=flat)`,
    `![issues](https://img.shields.io/github/issues/${owner}/${repo}?style=flat)`,
    `![license](https://img.shields.io/github/license/${owner}/${repo}?style=flat)`,
    `![last commit](https://img.shields.io/github/last-commit/${owner}/${repo}?style=flat)`
  ];
  return set.join(' ');
}

export function refreshPreview(md: string, prev: HTMLElement, emojify = false): void {
  prev.innerHTML = mdToHtml(md, { emojify });
  import('../render/highlight.js').then(({ highlightAll }) => highlightAll(prev as unknown as Document));
}

export function renderLint(
  res: { issues: { sev: string; line?: number; msg: string }[] },
  panel: HTMLElement,
  list: HTMLElement,
  sum: HTMLElement
): void {
  list.innerHTML = '';
  let errs = 0,
    warns = 0;
  res.issues.forEach(it => {
    if (it.sev === 'err') errs++;
    else if (it.sev === 'warn') warns++;
  });
  sum.textContent = `Erros: ${errs} • Avisos: ${warns} • Itens: ${res.issues.length}`;
  res.issues.forEach(it => {
    const li = document.createElement('li');
    li.className = it.sev;
    li.textContent = (it.line ? `L${it.line}: ` : '') + it.msg;
    list.appendChild(li);
  });
  panel.hidden = false;
}
