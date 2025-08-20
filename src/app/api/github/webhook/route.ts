import { NextRequest, NextResponse } from "next/server";
import { verifyGitHubWebhook } from "@/lib/github/verify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");
  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "GITHUB_APP_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );

  const ok = verifyGitHubWebhook(rawBody, sig, secret);
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const payload = JSON.parse(rawBody);

  if (event === "installation") {
    // TODO: persist installation.id
  }
  if (event === "push") {
    // TODO: handle push events
  }

  return NextResponse.json({ received: true });
}
