import hljs from 'highlight.js';

export function highlightAll(root = document) {
  root.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
}

