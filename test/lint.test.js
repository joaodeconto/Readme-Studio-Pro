import test from 'node:test';
import assert from 'node:assert';
import { lintLinksAndImages } from '../src/utils/lint.js';

test('lintLinksAndImages returns only relative entries', () => {
  const md = `
[absolute](https://example.com)
[anchor](#local)
[relative](./file.md)
[refLink][my-ref]
[paren](./file(test).md)
![pic](./img(foo).png)

[my-ref]: ./ref.md
`;

  const result = lintLinksAndImages(md);

  assert.deepStrictEqual(result, {
    links: [
      { text: 'relative', url: './file.md' },
      { text: 'refLink', url: './ref.md' },
      { text: 'paren', url: './file(test).md' }
    ],
    images: [ { alt: 'pic', url: './img(foo).png' } ]
  });
});
