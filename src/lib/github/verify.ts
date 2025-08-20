import crypto from "crypto";

export function verifyGitHubWebhook(body: string, signature256: string | null, secret: string) {
  if (!signature256) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature256));
}
