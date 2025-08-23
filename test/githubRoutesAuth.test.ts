import { describe, expect, test, vi } from "vitest";

vi.mock("next/server", () => {
  class NextRequest extends Request {}
  const NextResponse = {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { "content-type": "application/json", ...(init?.headers || {}) },
      }),
  };
  return { NextRequest, NextResponse };
});

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@/lib/github/app", () => ({
  githubApp: { getInstallationOctokit: vi.fn() },
}));

vi.mock("@/lib/github/installations", () => ({
  findAuthorizedInstallationIdForRepo: vi.fn(),
}));

import { POST as BranchPOST } from "@/app/api/github/branch/route";
import { GET as FileGET } from "@/app/api/github/file/route";
import { POST as PrPOST } from "@/app/api/github/pr/route";

describe("github route auth", () => {
  test("branch POST rejects unauthenticated", async () => {
    const req = new Request("https://example.com/api", {
      method: "POST",
      body: JSON.stringify({
        owner: "o",
        repo: "r",
        newBranch: "b",
        fromSha: "s",
      }),
    });
    const res = await BranchPOST(req);
    expect(res.status).toBe(401);
  });

  test("file GET rejects unauthenticated", async () => {
    const req = new Request("https://example.com/api?owner=o&repo=r&path=p");
    const res = await FileGET(req);
    expect(res.status).toBe(401);
  });

  test("pr POST rejects unauthenticated", async () => {
    const req = new Request("https://example.com/api", {
      method: "POST",
      body: JSON.stringify({
        owner: "o",
        repo: "r",
        title: "t",
        body: "b",
        head: "h",
        base: "m",
      }),
    });
    const res = await PrPOST(req);
    expect(res.status).toBe(401);
  });
});

