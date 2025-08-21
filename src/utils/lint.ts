import { githubSlugify as slug } from './githubSlug';
import MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it';

const mdParser = new MarkdownIt();

export interface Heading {
  level: number;
  title: string;
  anchor: string;
  line: number;
}

export interface LintIssue {
  sev: 'err' | 'warn' | 'ok';
  msg: string;
  line?: number;
}

export interface LintMarkdownResult {
  issues: LintIssue[];
  headings: Heading[];
}

export interface LintLinksAndImagesResult {
  links: { text: string; url: string }[];
  images: { alt: string; url: string }[];
}

interface TOCBlock {
  start: number;
  end: number;
  lines: string[];
}

interface TOCAnchor {
  anchor: string;
  lineOffset: number;
}

interface LocalAnchor {
  anchor: string;
  line: number;
}

interface ParsedImage {
  alt: string;
  src: string;
  line: number;
}

interface ParsedLink {
  text: string;
  href: string;
  line: number;
}

function parseHeadings(md: string): Heading[] {
  const withoutCode = md.replace(/```[\s\S]*?```/g, '');
  const lines = withoutCode.split('\n');
  const heads: Heading[] = [];
  lines.forEach((ln, i) => {
    const m = ln.match(/^(#{1,6})\s+(.+)/);
    if (!m) return;
    const level = m[1].length;
    const title = m[2].trim();
    heads.push({ level, title, anchor: slug(title), line: i + 1 });
  });
  return heads;
}

export function lintLinksAndImages(md: string): LintLinksAndImagesResult {
  const links: { text: string; url: string }[] = [];
  const images: { alt: string; url: string }[] = [];

  const collect = (tokens: Token[]): void => {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'link_open') {
        const href = token.attrGet('href');
        if (href && !href.startsWith('#') && !/^https?:\/\//i.test(href)) {
          let text = '';
          for (
            let j = i + 1;
            j < tokens.length && tokens[j].type !== 'link_close';
            j++
          ) {
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

function findTOCBlock(md: string): TOCBlock | null {
  const lines = md.split('\n');
  let start = -1,
    end = -1;
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

function parseAnchorsInTOCBlock(block: TOCBlock): TOCAnchor[] {
  const anchors: TOCAnchor[] = [];
  block.lines.forEach((ln, i) => {
    const m = ln.match(/\]\(#([^)]+)\)/);
    if (m) anchors.push({ anchor: m[1], lineOffset: i });
  });
  return anchors;
}

function parseAllLocalAnchors(md: string): LocalAnchor[] {
  const anchors: LocalAnchor[] = [];
  const re = /\]\(#([^)]+)\)/g;
  let m: RegExpExecArray | null;
  const lines = md.split('\n');
  lines.forEach((ln, i) => {
    while ((m = re.exec(ln))) anchors.push({ anchor: m[1], line: i + 1 });
  });
  return anchors;
}

function parseImages(md: string): ParsedImage[] {
  const imgs: ParsedImage[] = [];
  const re = /!\[([^\]]*)\]\(([^\)\s]+)(?:\s+\"[^\"]*\")?\)/g;
  let m: RegExpExecArray | null;
  const lines = md.split('\n');
  lines.forEach((ln, i) => {
    while ((m = re.exec(ln))) imgs.push({ alt: m[1], src: m[2], line: i + 1 });
  });
  return imgs;
}

function parseLinks(md: string): ParsedLink[] {
  const links: ParsedLink[] = [];
  const re = /\[([^\]]+)\]\(([^\)]+)\)/g;
  let m: RegExpExecArray | null;
  const lines = md.split('\n');
  lines.forEach((ln, i) => {
    while ((m = re.exec(ln))) links.push({ text: m[1], href: m[2], line: i + 1 });
  });
  return links;
}

export function lintMarkdown(md: string): LintMarkdownResult {
  const heads = parseHeadings(md);
  const tocBlock = findTOCBlock(md);
  const result: LintIssue[] = [];

  const h1 = heads.find((h) => h.level === 1);
  if (!h1) result.push({ sev: 'warn', msg: 'Falta um título H1 no início do README.' });

  const anchorsDoc = new Set(heads.map((h) => h.anchor));

  if (tocBlock) {
    const tocAnchors = parseAnchorsInTOCBlock(tocBlock);
    tocAnchors.forEach((a) => {
      if (!anchorsDoc.has(a.anchor)) {
        result.push({
          sev: 'err',
          msg: `TOC aponta para âncora inexistente: #${a.anchor}`,
          line: tocBlock.start + a.lineOffset,
        });
      }
    });
    const expected = heads.map((h) => h.anchor);
    const got = tocAnchors.map((t) => t.anchor);
    const norm = (arr: string[]) => arr.filter((a, i) => arr.indexOf(a) === i);
    if (JSON.stringify(norm(got)) !== JSON.stringify(norm(expected))) {
      result.push({
        sev: 'warn',
        msg: 'TOC possivelmente desatualizado (ordem/itens diferem dos headings).',
      });
    }
  } else {
    result.push({ sev: 'warn', msg: 'Sem seção de Sumário (TOC).' });
  }

  parseAllLocalAnchors(md).forEach((a) => {
    if (!anchorsDoc.has(a.anchor)) {
      result.push({
        sev: 'err',
        msg: `Link âncora #${a.anchor} não encontrado em nenhum heading.`,
        line: a.line,
      });
    }
  });

  parseImages(md).forEach((img) => {
    if (!img.alt.trim())
      result.push({ sev: 'warn', msg: `Imagem sem alt na linha ${img.line}: ${img.src}` });
    if (!/^https?:\/\//.test(img.src) && !/^[\.\/]/.test(img.src)) {
      result.push({
        sev: 'warn',
        msg: `Imagem com caminho possivelmente inválido (esperado relativo ./ ou /): ${img.src}`,
        line: img.line,
      });
    }
  });

  parseLinks(md).forEach((lk) => {
    if (/^www\./i.test(lk.href))
      result.push({
        sev: 'warn',
        msg: `Link sem protocolo: ${lk.href} (use https://...)`,
        line: lk.line,
      });
  });

  if (result.length === 0)
    result.push({ sev: 'ok', msg: 'Nenhum problema encontrado. 🎉' });
  return { issues: result, headings: heads };
}
