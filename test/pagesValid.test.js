import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const pages = [
  'src/app/web/(dashboard)/page.tsx',
  'src/app/web/automations/page.tsx',
  'src/app/web/editor/[owner]/[repo]/page.tsx',
  'src/app/web/repositories/page.tsx',
  'src/app/web/settings/page.tsx',
  'src/app/web/templates/page.tsx'
];

pages.forEach(page => {
  test(`page ${page} has default export`, () => {
    const content = readFileSync(path.join(process.cwd(), page), 'utf8');
    assert.match(content, /export default/, `Expected ${page} to export default`);
  });
});
