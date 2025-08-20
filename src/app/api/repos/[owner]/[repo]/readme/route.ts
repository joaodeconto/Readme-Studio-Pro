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
    return NextResponse.json({ error: e.message }, { status });
  }
}

async function findInstallationIdForRepo(owner: string, repo: string): Promise<number> {
  const link = await prisma.repoLink.findFirst({ where: { owner, repo } });
  if (link) return link.installationId;

  try {
    const { data } = await githubApp.octokit.request(
      "GET /repos/{owner}/{repo}/installation",
      { owner, repo }
    );
    await prisma.repoLink.create({
      data: { owner, repo, installationId: data.id },
    });
    return data.id;
  } catch (e: any) {
    if (e.status === 404) {
      throw new Error(`No installation found for ${owner}/${repo}`);
    }
    throw e;
  }
}
