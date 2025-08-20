import test from 'node:test';
import assert from 'node:assert';
import { lintLinksAndImages } from '../src/utils/lint.js';

test('lintLinksAndImages returns only relative entries', () => {
  const md = `
[absolute](https://example.com)
[anchor](#local)
[relative](./file.md)
`;

  const result = lintLinksAndImages(md);

  assert.deepStrictEqual(result, {
    links: [ { text: 'relative', url: './file.md' } ],
    images: []
  });
});
