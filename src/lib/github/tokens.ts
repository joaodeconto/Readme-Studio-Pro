import { githubApp } from "@/lib/github/app";

export async function getInstallationToken(installationId: number) {
  const jwtOctokit = await githubApp.getInstallationOctokit(installationId);
  // @ts-ignore - octokit typing doesn't expose .auth
  const token = await jwtOctokit.auth({ type: "installation" });
  return { octokit: jwtOctokit, token };
}
