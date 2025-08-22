import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('next/server', () => {
  class NextRequest extends Request {}
  const NextResponse = {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
      })
  };
  return { NextRequest, NextResponse };
});

vi.mock('@/lib/github/verify', () => ({
  verifyGitHubWebhook: () => true
}));

vi.mock('@/lib/db/client', () => ({
  prisma: { installation: { upsert: vi.fn(() => Promise.resolve()) } }
}));
import { POST } from '@/app/api/github/webhook/route';
import { logger } from '@/lib/logger';

describe('github webhook logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    process.env.GITHUB_APP_WEBHOOK_SECRET = 'test';
  });

  test('logs push event', async () => {
    const payload = {
      installation: { id: 1, account: { login: 'user', id: 2 } },
      repository: { full_name: 'owner/repo' },
      head_commit: { id: 'abc', message: 'msg' }
    };
    const req = new Request('https://example.com/api', {
      method: 'POST',
      headers: {
        'x-github-event': 'push',
        'x-hub-signature-256': 'sha256=test'
      },
      body: JSON.stringify(payload)
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(logger.info).toHaveBeenCalledWith('github.push', {
      repo: 'owner/repo',
      commit: 'abc',
      message: 'msg'
    });
  });

  test('logs installation event', async () => {
    const payload = { installation: { id: 2, account: { login: 'user', id: 3 } } };
    const req = new Request('https://example.com/api', {
      method: 'POST',
      headers: {
        'x-github-event': 'installation',
        'x-hub-signature-256': 'sha256=test'
      },
      body: JSON.stringify(payload)
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(logger.info).toHaveBeenCalledWith('github.installation', {
      installationId: 2
    });
  });
});
