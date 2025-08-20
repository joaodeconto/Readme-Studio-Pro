import { NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";
import { findInstallationIdForRepo } from "@/lib/github/installations";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
  head: z.string(),
  base: z.string(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing owner|repo|title|body|head|base" },
      { status: 400 }
    );
  }

  const { owner, repo, title, body, head, base } = parsed.data;

  try {
    const installationId = await findInstallationIdForRepo(owner, repo);
    const octokit = await githubApp.getInstallationOctokit(installationId);
    const { data } = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      title,
      body,
      head,
      base,
    });
    return NextResponse.json(data);
  } catch (e) {
    const err = e as {
      status?: number;
      response?: { data?: { message?: string } };
      message?: string;
    };
    const status = err.status ?? 500;
    const message = err.response?.data?.message || err.message || "Internal error";
    return NextResponse.json({ error: message }, { status });
  }
}

