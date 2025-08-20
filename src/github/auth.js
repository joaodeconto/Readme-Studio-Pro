import { BACKEND_URL } from './config.js';

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

  return new Promise((resolve, reject) => {
    const popup = window.open(`${BACKEND_URL}/auth/github`, 'gh-oauth', 'width=600,height=700');
    if (!popup) {
      reject(new Error('POPUP_BLOCKED'));
      return;
    }
    const origin = new URL(BACKEND_URL).origin;
    function handler(ev) {
      if (ev.origin !== origin) return;
      const token = ev.data?.token;
      if (token) {
        setToken(token);
        window.removeEventListener('message', handler);
        popup.close();
        resolve(token);
      }
    }
    window.addEventListener('message', handler);
  });
}

export const __TESTING__ = { TOKEN_KEY };
