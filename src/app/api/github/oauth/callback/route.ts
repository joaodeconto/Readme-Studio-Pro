import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";

const STATE_COOKIE = "gh_oauth_state";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !storedState || state !== storedState) {
    const res = NextResponse.redirect(new URL("/?github=error", req.url));
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  const session = await getSessionUser();
  if (!session) {
    const res = NextResponse.redirect(new URL("/?github=unauthenticated", req.url));
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  try {
    const { authentication } = await githubApp.oauth.createToken({ code });
    await prisma.user.update({
      where: { id: session.id },
      data: { githubAccessToken: authentication.token },
    });
    const res = NextResponse.redirect(new URL("/dashboard?github=success", req.url));
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (e) {
    console.error("OAuth callback failed", e);
    const res = NextResponse.redirect(new URL("/dashboard?github=error", req.url));
    res.cookies.delete(STATE_COOKIE);
    return res;
  }
}
