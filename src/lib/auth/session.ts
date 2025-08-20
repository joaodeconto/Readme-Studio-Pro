import { NextRequest } from "next/server";

export interface SessionUser {
  id: number;
}

/**
 * Placeholder session lookup.
 *
 * TODO: replace header-based lookup with real session management
 * (e.g. cookies or NextAuth).
 */
export async function getSessionUser(
  req: NextRequest
): Promise<SessionUser | null> {
  const id = req.headers.get("x-user-id");
  return id ? { id: Number(id) } : null;
}

