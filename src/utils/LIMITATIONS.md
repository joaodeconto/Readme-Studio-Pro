# Limitações do lint de Markdown

O `lintLinksAndImages` agora usa o parser [`markdown-it`](https://github.com/markdown-it/markdown-it),
mas as demais rotinas de `src/utils/lint.ts` ainda dependem de expressões regulares simples.
Consequentemente:

- Tags HTML (`<a>`, `<img>`) não são analisadas;
- Extensões de Markdown fora do padrão podem ser ignoradas.

Essas limitações devem ser consideradas ao evoluir o lint.

> **Nota:** No navegador, o `markdown-it` é carregado via CDN
(`https://esm.sh/markdown-it@14.1.0`) ou precisa ser incluído em um
processo de bundling para ser resolvido.
