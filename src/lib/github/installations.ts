import { githubApp } from "@/lib/github/app";
import { prisma } from "@/lib/db/client";

/**
 * Resolve installation id for a repo, caching in Prisma.
 */
export async function findInstallationIdForRepo(owner: string, repo: string): Promise<number> {
  const link = await prisma.repoLink.findFirst({ where: { owner, repo } });
  if (link) return link.installationId;

  const { data } = await githubApp.octokit.request(
    "GET /repos/{owner}/{repo}/installation",
    { owner, repo }
  );
  await prisma.repoLink.create({
    data: { owner, repo, installationId: data.id },
  });
  return data.id;
}
