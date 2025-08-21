import test from 'node:test';
import assert from 'node:assert';

globalThis.localStorage = { getItem: () => null };
globalThis.document = { getElementById: () => null };

const { __TESTING__ } = await import('../src/github/fetch.ts');
const { discoverDefaultBranch } = __TESTING__;

test('discoverDefaultBranch', async (t) => {
  await t.test('uses API default_branch', async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => new Response(JSON.stringify({ default_branch: 'dev' }), { status: 200 });
    const branch = await discoverDefaultBranch('owner', 'repo');
    assert.strictEqual(branch, 'dev');
    global.fetch = originalFetch;
  });

  await t.test('defaults to main when absent', async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => new Response('{}', { status: 200 });
    const branch = await discoverDefaultBranch('owner', 'repo');
    assert.strictEqual(branch, 'main');
    global.fetch = originalFetch;
  });
});
