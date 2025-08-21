const test = require('node:test');
const assert = require('node:assert/strict');
const { applyEmojis } = require('../emojiHelpers.js');

test('Headings starting with emoji remain unchanged', () => {
  global.useEmoji = { checked: true };
  const input = '# ⚙️ Instalação';
  const output = applyEmojis(input);
  assert.equal(output, '# ⚙️ Instalação');
});

test('Known section titles receive the correct emoji', () => {
  global.useEmoji = { checked: true };
  const input = '# Instalação';
  const output = applyEmojis(input);
  assert.equal(output, '# ⚙️ Instalação');
});

test('Partial matches work', () => {
  global.useEmoji = { checked: true };
  const input = '# Instalação rápida';
  const output = applyEmojis(input);
  assert.equal(output, '# ⚙️ Instalação rápida');
});

test('Headings with unknown titles remain unchanged', () => {
  global.useEmoji = { checked: true };
  const input = '# Random';
  const output = applyEmojis(input);
  assert.equal(output, '# Random');
});

test('No emoji added when useEmoji flag is off', () => {
  global.useEmoji = { checked: false };
  const input = '# Instalação';
  const output = applyEmojis(input);
  assert.equal(output, '# Instalação');
});
