import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";

export const runtime = "nodejs";

const STATE_COOKIE = "gh_oauth_state";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !storedState || state !== storedState) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  const { authentication } = await githubApp.oauth.createToken({ code });
  // TODO: vincular token ao usuário local

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.delete(STATE_COOKIE);
  return res;
}
