import { describe, it, expect } from 'vitest';
import { mdToHtml } from '../src/render/markdown.js';

describe('mdToHtml', () => {
  it('renders headings with ids', () => {
    const html = mdToHtml('# Heading');
    expect(html.trim()).toBe('<h1 id="heading" tabindex="-1">Heading</h1>');
  });

  it('renders lists', () => {
    const html = mdToHtml('- a\n- b');
    expect(html.trim()).toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>');
  });

  it('renders tables', () => {
    const html = mdToHtml('| h1 | h2 |\n| --- | --- |\n| c1 | c2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<td>c1</td>');
    expect(html).toContain('<td>c2</td>');
  });

  it('renders blockquotes', () => {
    const html = mdToHtml('> quote');
    expect(html.trim()).toBe('<blockquote>\n<p>quote</p>\n</blockquote>');
  });
});
