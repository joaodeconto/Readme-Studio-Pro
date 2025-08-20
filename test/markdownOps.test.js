import test from 'node:test';
import assert from 'node:assert/strict';

test('markdownOps helpers', async () => {
  const { countStats, buildBadgeUrl, generateGithubBadges } = await import('../src/ui/markdownOps.ts');
  const md = '# Title\n\nHello world\n## Sub\nmore text';
  assert.equal(countStats(md), '6 palavras \u2022 2 seções');
  const url = buildBadgeUrl('my badge', 'ok', 'blue', 'github');
  assert.equal(url, 'https://img.shields.io/badge/my%20badge-ok-blue?logo=github');
  const set = generateGithubBadges('o', 'r');
  assert.ok(set.includes('github/stars/o/r'));
  assert.ok(set.includes('github/forks/o/r'));
});
