import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItTaskLists from 'markdown-it-task-lists';
import markdownItTable from 'markdown-it-multimd-table';
import markdownItGithubAlerts from 'markdown-it-github-alerts';
import DOMPurify from 'isomorphic-dompurify';

import { slug } from '../utils/slug';
import { emojifyTitle } from '../features/emoji';

const md = MarkdownIt({ linkify: true })
  .use(markdownItTaskLists)
  .use(markdownItTable)
  .use(markdownItGithubAlerts)
  .use(markdownItAnchor, {
    slugify: (s) => slug(s),
  });

const defaultLinkOpen = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  token.attrSet('target', '_blank');
  token.attrSet('rel', 'noopener');
  return defaultLinkOpen(tokens, idx, options, env, self);
};

export function mdToHtml(src, { emojify = false } = {}) {
  const env = {};
  const tokens = md.parse(src, env);

  if (emojify) {
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === 'heading_open') {
        const level = Number(t.tag.slice(1));
        const inline = tokens[i + 1];
        if (inline && inline.type === 'inline') {
          inline.content = emojifyTitle(inline.content, level, true);
          inline.children?.forEach((child) => {
            if (child.type === 'text') {
              child.content = emojifyTitle(child.content, level, true);
            }
          });
        }
      }
    }
  }

  const html = md.renderer.render(tokens, md.options, env);
  return DOMPurify.sanitize(html);
}
