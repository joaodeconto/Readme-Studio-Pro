import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: { owner: string; repo: string } }) {
  const installationId = await findInstallationIdForRepo(params.owner, params.repo);
  const octokit = await githubApp.getInstallationOctokit(installationId);

  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/readme", {
      owner: params.owner,
      repo: params.repo,
      mediaType: { format: "raw" },
    });
    return new NextResponse(data as unknown as BodyInit, {
      status: 200,
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  } catch (e: any) {
    const status = e.status || 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}

async function findInstallationIdForRepo(owner: string, repo: string): Promise<number> {
  // TODO: consultar o banco
  throw new Error("Not implemented");
}
