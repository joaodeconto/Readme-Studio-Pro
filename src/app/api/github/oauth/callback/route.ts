import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.redirect(new URL("/", req.url));

  const { authentication } = await githubApp.oauth.createToken({ code });
  // TODO: vincular token ao usuário local

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
