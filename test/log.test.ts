import { describe, expect, test, vi } from 'vitest';
import { log, getLogText } from '@/utils/log';

describe('log', () => {
  test('runs in a Node environment', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log('hello', { a: 1 });
    expect(getLogText()).toMatch(/hello/);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
