import { githubSlugify as slug } from './githubSlug.js';
import MarkdownIt from 'markdown-it';

const mdParser = new MarkdownIt();

function parseHeadings(md) {
    const withoutCode = md.replace(/```[\s\S]*?```/g, '');
    const lines = withoutCode.split('\n');
    const heads = [];
    lines.forEach((ln, i) => {
        const m = ln.match(/^(#{1,6})\s+(.+)/);
        if (!m) return;
        const level = m[1].length;
        const title = m[2].trim();
        heads.push({ level, title, anchor: slug(title), line: i + 1 });
    });
    return heads;
}

// Lint simples de links/imagens (relativos)
// Usa um parser de Markdown para evitar casos falsos com regex.
// Limitações: tags HTML (<a>/<img>) não são analisadas e o restante
// das funções neste arquivo ainda dependem de regex simples.
export function lintLinksAndImages(md) {
  const links = [];
  const images = [];

  const collect = (tokens) => {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'link_open') {
        const href = token.attrGet('href');
        if (href && !href.startsWith('#') && !/^https?:\/\//i.test(href)) {
          let text = '';
          for (let j = i + 1; j < tokens.length && tokens[j].type !== 'link_close'; j++) {
            text += tokens[j].content || '';
          }
          links.push({ text, url: href });
        }
        while (i < tokens.length && tokens[i].type !== 'link_close') i++;
      } else if (token.type === 'image') {
        const src = token.attrGet('src');
        const alt = token.content || token.attrGet('alt') || '';
        if (src && !/^https?:\/\//i.test(src)) {
          images.push({ alt, url: src });
        }
      }

      if (token.children) collect(token.children);
    }
  };

  collect(mdParser.parse(md, {}));

  return { links, images };
}

function findTOCBlock(md) {
    const lines = md.split('\n');
    let start = -1, end = -1;
    for (let i = 0; i < lines.length; i++) {
        if (/^##\s+.*(sum[aá]rio|table\s*of\s*contents)/i.test(lines[i])) {
            start = i + 1;
            break;
        }
    }
    if (start === -1) return null;
    while (start < lines.length && !lines[start].trim()) start++;
    end = start;
    while (end < lines.length && /^\s*-\s+\[.+\]\(#.+\)/.test(lines[end])) end++;
    if (end === start) return null;
    return { start, end, lines: lines.slice(start, end) };
}

function parseAnchorsInTOCBlock(block) {
    const anchors = [];
    block.lines.forEach((ln, i) => {
        const m = ln.match(/\]\(#([^)]+)\)/);
        if (m) anchors.push({ anchor: m[1], lineOffset: i });
    });
    return anchors;
}

function parseAllLocalAnchors(md) {
    const anchors = [];
    const re = /\]\(#([^)]+)\)/g;
    let m;
    const lines = md.split('\n');
    lines.forEach((ln, i) => {
        while ((m = re.exec(ln))) anchors.push({ anchor: m[1], line: i + 1 });
    });
    return anchors;
}

function parseImages(md) {
    const imgs = [];
    const re = /!\[([^\]]*)\]\(([^\)\s]+)(?:\s+\"[^\"]*\")?\)/g;
    let m;
    const lines = md.split('\n');
    lines.forEach((ln, i) => {
        while ((m = re.exec(ln))) imgs.push({ alt: m[1], src: m[2], line: i + 1 });
    });
    return imgs;
}

function parseLinks(md) {
    const links = [];
    const re = /\[([^\]]+)\]\(([^\)]+)\)/g;
    let m;
    const lines = md.split('\n');
    lines.forEach((ln, i) => {
        while ((m = re.exec(ln))) links.push({ text: m[1], href: m[2], line: i + 1 });
    });
    return links;
}

export function lintMarkdown(md) {
    const heads = parseHeadings(md);
    const tocBlock = findTOCBlock(md);
    const result = [];

    const h1 = heads.find(h => h.level === 1);
    if (!h1) result.push({ sev: 'warn', msg: 'Falta um título H1 no início do README.' });

    const anchorsDoc = new Set(heads.map(h => h.anchor));

    if (tocBlock) {
        const tocAnchors = parseAnchorsInTOCBlock(tocBlock);
        tocAnchors.forEach(a => {
            if (!anchorsDoc.has(a.anchor)) {
                result.push({ sev: 'err', msg: `TOC aponta para âncora inexistente: #${a.anchor}`, line: tocBlock.start + a.lineOffset });
            }
        });
        const expected = heads.map(h => h.anchor);
        const got = tocAnchors.map(t => t.anchor);
        const norm = (arr) => arr.filter((a, i) => arr.indexOf(a) === i);
        if (JSON.stringify(norm(got)) !== JSON.stringify(norm(expected))) {
            result.push({ sev: 'warn', msg: 'TOC possivelmente desatualizado (ordem/itens diferem dos headings).' });
        }
    } else {
        result.push({ sev: 'warn', msg: 'Sem seção de Sumário (TOC).' });
    }

    parseAllLocalAnchors(md).forEach(a => {
        if (!anchorsDoc.has(a.anchor)) {
            result.push({ sev: 'err', msg: `Link âncora #${a.anchor} não encontrado em nenhum heading.`, line: a.line });
        }
    });

    parseImages(md).forEach(img => {
        if (!img.alt.trim()) result.push({ sev: 'warn', msg: `Imagem sem alt na linha ${img.line}: ${img.src}` });
        if (!/^https?:\/\//.test(img.src) && !/^[\.\/]/.test(img.src)) {
            result.push({ sev: 'warn', msg: `Imagem com caminho possivelmente inválido (esperado relativo ./ ou /): ${img.src}`, line: img.line });
        }
    });

    parseLinks(md).forEach(lk => {
        if (/^www\./i.test(lk.href)) result.push({ sev: 'warn', msg: `Link sem protocolo: ${lk.href} (use https://...)`, line: lk.line });
    });

    if (result.length === 0) result.push({ sev: 'ok', msg: 'Nenhum problema encontrado. 🎉' });
    return { issues: result, headings: heads };
}
