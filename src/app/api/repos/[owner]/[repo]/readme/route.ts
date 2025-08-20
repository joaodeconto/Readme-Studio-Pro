import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";
import { findInstallationIdForRepo } from "@/lib/github/installations";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: any
) {
  const { owner, repo } = context.params as { owner: string; repo: string };
  const installationId = await findInstallationIdForRepo(owner, repo);
  const octokit = await githubApp.getInstallationOctokit(installationId);

  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/readme", {
      owner,
      repo,
      mediaType: { format: "raw" },
    });
    return new NextResponse(data as unknown as BodyInit, {
      status: 200,
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  } catch (e: any) {
    const status = e.status || 500;
    console.error("[repos/readme]", e);
    return NextResponse.json({ error: "Internal error" }, { status });
  }
}
