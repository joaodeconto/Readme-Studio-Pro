import { slug } from '../utils/slug.js';

function linkify(s) {
  return s.replace(/\bhttps?:\/\/[^\s)]+/g, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}

// Converte markdown simplificado em HTML. Foca em headings, listas, tabelas, blockquotes e links.
export function mdToHtml(src) {
  // Headings com id consistente
  src = src
    .replace(/^######\s?(.+)$/gm, (m,t)=>`<h6 id="${slug(t)}">${t}</h6>`)
    .replace(/^#####\s?(.+)$/gm, (m,t)=>`<h5 id="${slug(t)}">${t}</h5>`)
    .replace(/^####\s?(.+)$/gm, (m,t)=>`<h4 id="${slug(t)}">${t}</h4>`)
    .replace(/^###\s?(.+)$/gm,  (m,t)=>`<h3 id="${slug(t)}">${t}</h3>`)
    .replace(/^##\s?(.+)$/gm,   (m,t)=>`<h2 id="${slug(t)}">${t}</h2>`)
    .replace(/^#\s?(.+)$/gm,    (m,t)=>`<h1 id="${slug(t)}">${t}</h1>`);

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