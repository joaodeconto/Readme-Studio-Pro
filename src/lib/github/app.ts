import { App } from "octokit";

function getPrivateKey(): string {
  const b64 = process.env.GITHUB_APP_PRIVATE_KEY_B64;
  if (!b64) throw new Error("Missing GITHUB_APP_PRIVATE_KEY_B64");
  return Buffer.from(b64, "base64").toString("utf8");
}

export const githubApp = new App({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: getPrivateKey(),
  oauth: {
    clientId: process.env.GITHUB_APP_CLIENT_ID!,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
  },
});
