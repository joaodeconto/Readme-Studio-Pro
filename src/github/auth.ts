const TOKEN_KEY = 'readmeStudioProAuth';

export interface Token {
  value: string;
}

export function getToken(): Token | null {
  try {
    const value = localStorage.getItem(TOKEN_KEY);
    return value ? { value } : null;
  } catch {
    return null;
  }
}

export function setToken(tok: Token | null): void {
  try {
    if (tok) localStorage.setItem(TOKEN_KEY, tok.value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function startAuthFlow(): Promise<Token | null> {
  const existing = getToken();
  if (existing) return existing;

  window.location.href = '/api/github/oauth/start';
  return null;
}

export const __TESTING__ = { TOKEN_KEY };
