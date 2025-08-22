import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyGitHubWebhook } from "@/lib/github/verify";
import { prisma } from "@/lib/db/client";
import { logger } from "@/lib/logger";

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

  if (payload.installation?.id) {
    await prisma.installation.upsert({
      where: { installationId: payload.installation.id },
      update: {
        accountLogin: payload.installation.account?.login || "",
        accountId: payload.installation.account?.id || 0,
      },
      create: {
        installationId: payload.installation.id,
        accountLogin: payload.installation.account?.login || "",
        accountId: payload.installation.account?.id || 0,
      },
    });
  }

  switch (event) {
    case "push":
      logger.info("github.push", {
        repo: payload.repository?.full_name,
        commit: payload.head_commit?.id,
        message: payload.head_commit?.message,
      });
      break;
    case "installation": {
      logger.info("github.installation", {
        installationId: payload.installation?.id,
      });
      if (payload.action === "created" && payload.installation?.id) {
        const repos = (payload.repositories as Array<{ full_name: string }>) || [];
        for (const r of repos) {
          const [owner, name] = r.full_name.split("/");
          if (!owner || !name) continue;
          const existing = await prisma.repoLink.findFirst({
            where: { owner, repo: name },
          });
          if (existing) {
            await prisma.repoLink.update({
              where: { id: existing.id },
              data: { installationId: payload.installation.id },
            });
          } else {
            await prisma.repoLink.create({
              data: {
                owner,
                repo: name,
                installationId: payload.installation.id,
              },
            });
          }
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
