# Limitações do lint de Markdown

O `lintLinksAndImages` agora usa o parser [`markdown-it`](https://github.com/markdown-it/markdown-it),
mas as demais rotinas de `src/utils/lint.js` ainda dependem de expressões regulares simples.
Consequentemente:

- Tags HTML (`<a>`, `<img>`) não são analisadas;
- Extensões de Markdown fora do padrão podem ser ignoradas.

Essas limitações devem ser consideradas ao evoluir o lint.
