import test from 'node:test';
import assert from 'node:assert';

globalThis.localStorage = { getItem: () => null };

const { parseRepoSpec } = await import('../src/github/fetch.ts');

test('parse owner/repo', () => {
  const spec = parseRepoSpec('owner/repo');
  assert.strictEqual(spec.owner, 'owner');
  assert.strictEqual(spec.repo, 'repo');
  assert.strictEqual(spec.branch, undefined);
  assert.strictEqual(spec.path, undefined);
});

test('parse owner/repo@dev', () => {
  const spec = parseRepoSpec('owner/repo@dev');
  assert.strictEqual(spec.owner, 'owner');
  assert.strictEqual(spec.repo, 'repo');
  assert.strictEqual(spec.branch, 'dev');
  assert.strictEqual(spec.path, undefined);
});

test('parse https://github.com/owner/repo', () => {
  const spec = parseRepoSpec('https://github.com/owner/repo');
  assert.strictEqual(spec.owner, 'owner');
  assert.strictEqual(spec.repo, 'repo');
  assert.strictEqual(spec.branch, undefined);
  assert.strictEqual(spec.path, undefined);
});

test('parse https://github.com/owner/repo.git', () => {
  const spec = parseRepoSpec('https://github.com/owner/repo.git');
  assert.strictEqual(spec.owner, 'owner');
  assert.strictEqual(spec.repo, 'repo');
  assert.strictEqual(spec.branch, undefined);
  assert.strictEqual(spec.path, undefined);
});

test('parse owner/repo.git', () => {
  const spec = parseRepoSpec('owner/repo.git');
  assert.strictEqual(spec.owner, 'owner');
  assert.strictEqual(spec.repo, 'repo');
  assert.strictEqual(spec.branch, undefined);
  assert.strictEqual(spec.path, undefined);
});

test('parse owner/repo.git@main', () => {
  const spec = parseRepoSpec('owner/repo.git@main');
  assert.strictEqual(spec.owner, 'owner');
  assert.strictEqual(spec.repo, 'repo');
  assert.strictEqual(spec.branch, 'main');
  assert.strictEqual(spec.path, undefined);
});

test('parse raw.githubusercontent URL', () => {
  const url = 'https://raw.githubusercontent.com/owner/repo/main/README.md';
  const spec = parseRepoSpec(url);
  assert.deepStrictEqual(spec, { rawUrl: url });
  assert.strictEqual(spec.owner, undefined);
  assert.strictEqual(spec.repo, undefined);
  assert.strictEqual(spec.branch, undefined);
  assert.strictEqual(spec.path, undefined);
});
