import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";
import { findInstallationIdForRepo } from "@/lib/github/installations";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const path = searchParams.get("path");

  if (!owner || !repo || !path) {
    return NextResponse.json(
      { error: "MISSING_PARAMS", detail: "owner, repo, path" },
      { status: 400 }
    );
  }

  try {
    const installationId = await findInstallationIdForRepo(owner, repo);
    const octokit = await githubApp.getInstallationOctokit(installationId);
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      { owner, repo, path }
    );
    return NextResponse.json({ content: data.content, sha: data.sha });
  } catch (e: any) {
    const status = e.status || 500;
    const message = e.response?.data?.message || e.message || "Internal error";
    console.error("[github/file GET]", e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, path, content, message, sha } = body || {};
    if (!owner || !repo || !path || !content || !message || !sha) {
      return NextResponse.json(
        { error: "MISSING_FIELDS", detail: "owner, repo, path, content, message, sha" },
        { status: 400 }
      );
    }
    const installationId = await findInstallationIdForRepo(owner, repo);
    const octokit = await githubApp.getInstallationOctokit(installationId);
    const { data } = await octokit.request(
      "PUT /repos/{owner}/{repo}/contents/{path}",
      { owner, repo, path, message, content, sha }
    );
    return NextResponse.json({ content: data.content, commit: data.commit });
  } catch (e: any) {
    const status = e.status || 500;
    const message = e.response?.data?.message || e.message || "Internal error";
    console.error("[github/file PUT]", e);
    return NextResponse.json({ error: message }, { status });
  }
}
