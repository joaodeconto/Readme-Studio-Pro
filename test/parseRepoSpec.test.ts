import { test, expect } from 'vitest';

(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (_: string): string | null => null
} as Storage;

const { parseRepoSpec: parseRepoSpecUntyped } = await import('../src/github/fetch.ts');

interface RepoSpec {
  owner?: string;
  repo?: string;
  branch?: string;
  path?: string;
  rawUrl?: string;
}

const parseRepoSpec = parseRepoSpecUntyped as (spec: string) => RepoSpec;

test('parse owner/repo', () => {
  const spec: RepoSpec = parseRepoSpec('owner/repo');
  expect(spec.owner).toBe('owner');
  expect(spec.repo).toBe('repo');
  expect(spec.branch).toBeUndefined();
  expect(spec.path).toBeUndefined();
});

test('parse owner/repo@dev', () => {
  const spec: RepoSpec = parseRepoSpec('owner/repo@dev');
  expect(spec.owner).toBe('owner');
  expect(spec.repo).toBe('repo');
  expect(spec.branch).toBe('dev');
  expect(spec.path).toBeUndefined();
});

test('parse https://github.com/owner/repo', () => {
  const spec: RepoSpec = parseRepoSpec('https://github.com/owner/repo');
  expect(spec.owner).toBe('owner');
  expect(spec.repo).toBe('repo');
  expect(spec.branch).toBeUndefined();
  expect(spec.path).toBeUndefined();
});

test('parse https://github.com/owner/repo.git', () => {
  const spec: RepoSpec = parseRepoSpec('https://github.com/owner/repo.git');
  expect(spec.owner).toBe('owner');
  expect(spec.repo).toBe('repo');
  expect(spec.branch).toBeUndefined();
  expect(spec.path).toBeUndefined();
});

test('parse owner/repo.git', () => {
  const spec: RepoSpec = parseRepoSpec('owner/repo.git');
  expect(spec.owner).toBe('owner');
  expect(spec.repo).toBe('repo');
  expect(spec.branch).toBeUndefined();
  expect(spec.path).toBeUndefined();
});

test('parse owner/repo.git@main', () => {
  const spec: RepoSpec = parseRepoSpec('owner/repo.git@main');
  expect(spec.owner).toBe('owner');
  expect(spec.repo).toBe('repo');
  expect(spec.branch).toBe('main');
  expect(spec.path).toBeUndefined();
});

test('parse raw.githubusercontent URL', () => {
  const url: string = 'https://raw.githubusercontent.com/owner/repo/main/README.md';
  const spec: RepoSpec = parseRepoSpec(url);
  expect(spec).toStrictEqual({ rawUrl: url });
  expect(spec.owner).toBeUndefined();
  expect(spec.repo).toBeUndefined();
  expect(spec.branch).toBeUndefined();
  expect(spec.path).toBeUndefined();
});
