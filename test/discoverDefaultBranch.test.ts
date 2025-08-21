import { test, expect } from 'vitest';

(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (_: string): string | null => null
};

(globalThis as unknown as { document: Document }).document = {
  getElementById: (_: string): HTMLElement | null => null
} as Document;

const { __TESTING__ } = await import('../src/github/fetch.js');
const { discoverDefaultBranch } = __TESTING__ as {
  discoverDefaultBranch: (owner: string, repo: string) => Promise<string>;
};

test('discoverDefaultBranch uses API default_branch', async () => {
  const originalFetch: typeof fetch = global.fetch;
  global.fetch = async (): Promise<Response> =>
    new Response(JSON.stringify({ default_branch: 'dev' }), { status: 200 });
  const branch: string = await discoverDefaultBranch('owner', 'repo');
  expect(branch).toBe('dev');
  global.fetch = originalFetch;
});

test('discoverDefaultBranch defaults to main when absent', async () => {
  const originalFetch: typeof fetch = global.fetch;
  global.fetch = async (): Promise<Response> =>
    new Response('{}', { status: 200 });
  const branch: string = await discoverDefaultBranch('owner', 'repo');
  expect(branch).toBe('main');
  global.fetch = originalFetch;
});
