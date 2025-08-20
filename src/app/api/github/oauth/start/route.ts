import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { githubApp } from "@/lib/github/app";

export const runtime = "nodejs";

const STATE_COOKIE = "gh_oauth_state";

export async function GET() {
  const state = randomUUID();
  const { url } = await githubApp.oauth.getWebFlowAuthorizationUrl({ state });
  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
