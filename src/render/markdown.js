import { slug } from '../utils/slug.js';
import { emojifyTitle } from '../features/emoji.js';

function linkify(s) {
  return s.replace(/\bhttps?:\/\/[^\s)]+/g, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}

// md -> HTML. Novo: { emojify } para mostrar ícones em headings na prévia.
export function mdToHtml(src, { emojify=false } = {}) {
  const wrapHeading = (level, t) => {
    const text = emojify ? emojifyTitle(t, level, true) : t;   // força ter ícone na prévia
    const id = slug(t);                                        // slug SEM emoji (compatível com GitHub)
    return `<h${level} id="${id}">${text}</h${level}>`;
  };

  src = src
    .replace(/^######\s?(.+)$/gm, (m,t)=>wrapHeading(6,t))
    .replace(/^#####\s?(.+)$/gm, (m,t)=>wrapHeading(5,t))
    .replace(/^####\s?(.+)$/gm, (m,t)=>wrapHeading(4,t))
    .replace(/^###\s?(.+)$/gm,  (m,t)=>wrapHeading(3,t))
    .replace(/^##\s?(.+)$/gm,   (m,t)=>wrapHeading(2,t))
    .replace(/^#\s?(.+)$/gm,    (m,t)=>wrapHeading(1,t));

  // callouts + blockquotes
  src = src
    .replace(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/gmi, '<blockquote><b>$1:</b> $2</blockquote>')
    .replace(/^>\s?(.+)$/gm, '<blockquote>$1</blockquote>');

  // listas
  src = src.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  src = src.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);

  // tabelas (pipes simples)
  src = src.replace(/^\|(.+)\|$/gm, (m,row) => {
    const cells = row.split('|').map(c => c.trim()).filter(Boolean);
    return '<tr>' + cells.map(c => '<td>' + c + '</td>').join('') + '</tr>';
  });
  src = src.replace(/(<tr>.*?<\/tr>\n?)+/gs, m => '<table>' + m + '</table>');

  // parágrafos e links
  src = src.split(/\n{2,}/)
    .map(blk => /^\s*<(h\d|ul|ol|pre|table|blockquote|details|img|a)/.test(blk) ? blk : `<p>${linkify(blk).replace(/\n/g,'<br>')}</p>`)
    .join('\n');

  return src;
}
