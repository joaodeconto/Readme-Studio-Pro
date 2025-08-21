const TOKEN_KEY = 'readmeStudioProAuth';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(tok) {
  try {
    if (tok) localStorage.setItem(TOKEN_KEY, tok);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function startAuthFlow() {
  const existing = getToken();
  if (existing) return existing;

  window.location.href = '/api/github/oauth/start';
  return null;
}

export const __TESTING__ = { TOKEN_KEY };
