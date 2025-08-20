import { githubApp } from "@/lib/github/app";

export async function getInstallationToken(installationId: number) {
  const jwtOctokit = (await githubApp.getInstallationOctokit(
    installationId,
  )) as typeof githubApp.octokit;
  const token = await jwtOctokit.auth({ type: "installation" });
  return { octokit: jwtOctokit, token };
}
