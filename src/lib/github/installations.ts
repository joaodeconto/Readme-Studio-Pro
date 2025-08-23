import { githubApp } from "@/lib/github/app";
import { prisma } from "@/lib/db/client";
import { Octokit } from "octokit";

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

/**
 * Resolve installation id for a repo, ensuring the given user has access.
 * Returns null if the user is not authorized for the installation.
 */
export async function findAuthorizedInstallationIdForRepo(
  owner: string,
  repo: string,
  userId: number,
): Promise<number | null> {
  const installationId = await findInstallationIdForRepo(owner, repo);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const token = user?.githubAccessToken;
  if (!token) return null;
  const octokit = new Octokit({ auth: token });
  try {
    await octokit.request("GET /user/installations/{installation_id}", {
      installation_id: installationId,
    });
    return installationId;
  } catch {
    return null;
  }
}
