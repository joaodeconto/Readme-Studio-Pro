import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const token = user?.githubAccessToken;
  if (!token) {
    return NextResponse.json({ error: "NO_GITHUB_TOKEN" }, { status: 401 });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.request("GET /user/installations");
    const installationId = data.installations?.[0]?.id;
    if (!installationId) {
      return NextResponse.json({ error: "NO_INSTALLATIONS" }, { status: 404 });
    }
    return NextResponse.json({ installationId });
  } catch (e) {
    console.error("GET /api/github/install", e);
    return NextResponse.json(
      { error: "INSTALLATION_FETCH_FAILED" },
      { status: 500 }
    );
  }
}
