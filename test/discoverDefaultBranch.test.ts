import { test, expect, vi } from 'vitest';



(globalThis as unknown as { document: Document }).document = {
  getElementById: (_: string): HTMLElement | null => null,
} as Document;

const mockGet = vi.fn();
vi.mock('octokit', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: { repos: { get: mockGet } },
  })),
}));

const { __TESTING__ } = await import('../src/lib/github/fetch.js');
const { discoverDefaultBranch } = __TESTING__ as {
  discoverDefaultBranch: (owner: string, repo: string) => Promise<string>;
};

test('discoverDefaultBranch uses API default_branch', async () => {
  mockGet.mockResolvedValue({ data: { default_branch: 'dev' } });
  const branch: string = await discoverDefaultBranch('owner', 'repo');
  expect(branch).toBe('dev');
});

test('discoverDefaultBranch defaults to main when absent', async () => {
  mockGet.mockResolvedValue({ data: {} });
  const branch: string = await discoverDefaultBranch('owner', 'repo');
  expect(branch).toBe('main');
});
