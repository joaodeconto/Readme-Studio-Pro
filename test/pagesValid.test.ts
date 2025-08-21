import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const pages: readonly string[] = [
  'src/app/pages/(marketing)/page.tsx',
  'src/app/pages/automations/page.tsx',
  'src/app/pages/dashboard/page.tsx',
  'src/app/pages/repositories/page.tsx',
  'src/app/pages/settings/page.tsx',
  'src/app/pages/templates/page.tsx'
];

pages.forEach((page: string) => {
  test(`page ${page} has default export`, () => {
    const content: string = readFileSync(path.join(process.cwd(), page), 'utf8');
    expect(content).toMatch(/export\s+(default|{\s*default\s*})/);
  });
});
