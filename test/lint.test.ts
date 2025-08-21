import { test, expect } from 'vitest';
import { lintLinksAndImages } from '../src/utils/lint.js';

test('lintLinksAndImages returns only relative entries', () => {
  const md: string = `
[absolute](https://example.com)
[anchor](#local)
[relative](./file.md)
[refLink][my-ref]
[paren](./file(test).md)
![pic](./img(foo).png)

[my-ref]: ./ref.md
`;

  const result: ReturnType<typeof lintLinksAndImages> = lintLinksAndImages(md);

  expect(result).toStrictEqual({
    links: [
      { text: 'relative', url: './file.md' },
      { text: 'refLink', url: './ref.md' },
      { text: 'paren', url: './file(test).md' }
    ],
    images: [ { alt: 'pic', url: './img(foo).png' } ]
  });
});
