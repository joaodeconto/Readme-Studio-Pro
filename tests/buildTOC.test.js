const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Prepare global variable used by buildTOC
global.useEmoji = undefined;

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function extractBuildTOC() {
  const startToken = 'function buildTOC';
  const start = html.indexOf(startToken);
  if (start === -1) throw new Error('buildTOC not found');
  let depth = 0;
  let end = start;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  const fnText = html.slice(start, end);
  return new Function('return ' + fnText)();
}

const buildTOC = extractBuildTOC();

// Test headings with accents and special characters
test('handles accents and special characters', () => {
  const md = `\n## Café & Açúcar\n### Programação C# & C++\n`;
  const toc = buildTOC(md);
  assert.strictEqual(
    toc,
    '- [Café & Açúcar](#cafe-acucar)\n  - [Programação C# & C++](#programacao-c-c)'
  );
});

// Test headings with and without existing emojis and multiple levels
test('handles emojis and nested levels', () => {
  global.useEmoji = { checked: true };
  const md = `\n# Uso\n## Instalação\n## 😀 Alegria\n### Mais detalhes\n`;
  const toc = buildTOC(md);
  assert.strictEqual(
    toc,
    [
      '- [🚀 Uso](#uso)',
      '  - [⚙️ Instalação](#instalacao)',
      '  - [😀 Alegria](#alegria)',
      '    - [Mais detalhes](#mais-detalhes)'
    ].join('\n')
  );
  global.useEmoji = undefined;
});
