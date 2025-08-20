import { App } from "octokit";

function getPrivateKey(): string {
  const b64 = process.env.GITHUB_APP_PRIVATE_KEY_B64;
  if (!b64) throw new Error("Missing GITHUB_APP_PRIVATE_KEY_B64");
  return Buffer.from(b64, "base64").toString("utf8");
}

function requiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const appId = requiredEnvVar("GITHUB_APP_ID");
const clientId = requiredEnvVar("GITHUB_APP_CLIENT_ID");
const clientSecret = requiredEnvVar("GITHUB_APP_CLIENT_SECRET");

export const githubApp = new App({
  appId,
  privateKey: getPrivateKey(),
  oauth: {
    clientId,
    clientSecret,
  },
});
