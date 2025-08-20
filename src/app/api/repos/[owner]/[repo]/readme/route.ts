import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";
import { prisma } from "@/lib/db/client";

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
    console.error("[repos/readme]", e);
    return NextResponse.json({ error: "Internal error" }, { status });
  }
}

async function findInstallationIdForRepo(owner: string, repo: string): Promise<number> {
  const link = await prisma.repoLink.findFirst({
    where: { owner, repo },
    select: { installationId: true },
  });
  if (!link) throw new Error("Installation not found for repository");
  return link.installationId;
}
