import { cookies } from "next/headers";

export interface SessionUser {
  id: number;
}

const SESSION_COOKIE = "session_user_id";

/**
 * Retrieve the current authenticated user from a session cookie.
 *
 * This implementation assumes the user's id is stored in a cookie and
 * should be replaced with a full session mechanism (e.g. NextAuth) when
 * available.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const id = cookies().get(SESSION_COOKIE)?.value;
  return id ? { id: Number(id) } : null;
}

