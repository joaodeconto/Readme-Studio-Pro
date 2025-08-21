const TOKEN_KEY = 'readmeStudioProAuth';

export function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(tok) {
  if (typeof window === 'undefined') return;
  try {
    if (tok) window.localStorage.setItem(TOKEN_KEY, tok);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function startAuthFlow() {
  if (typeof window === 'undefined') return null;
  const existing = getToken();
  if (existing) return existing;

  window.location.href = '/api/github/oauth/start';
  return null;
}

export const __TESTING__ = { TOKEN_KEY };
