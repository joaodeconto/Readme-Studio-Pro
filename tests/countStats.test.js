const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert');

// Extract countStats from the bundled index.html so tests always reflect production logic
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fnMatch = html.match(/function countStats\(s\) {[^\n]+}/);
if (!fnMatch) {
  throw new Error('countStats function not found in index.html');
}
const context = {};
vm.runInNewContext(fnMatch[0], context);
const countStats = context.countStats;

// Markdown with multiple code blocks, inline code, headings, and non-Latin characters
const complexMarkdown = `# Title\nSome text with \`inline code\` and non-Latin characters like 你好.\n\n\`\`\`js\nconsole.log('first code');\n# inside code block\n\`\`\`\n\n## Subtitle\nAnother paragraph.\n\n\`\`\`py\nprint('second code')\n\`\`\``;

test('counts words and headings ignoring code blocks', () => {
  const result = countStats(complexMarkdown);
  assert.strictEqual(result, '14 palavras • 2 seções');
});

test('handles non-Latin text in headings and body', () => {
  const markdown = `# Заголовок\nПривет мир\n\n## 下节\nこんにちは\n\n\`\`\`js\nconsole.log('hi')\n\`\`\``;
  const result = countStats(markdown);
  assert.strictEqual(result, '0 palavras • 2 seções');
});
