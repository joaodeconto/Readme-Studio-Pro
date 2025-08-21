import { log } from '../utils/log.js';
import { BACKEND_URL } from './config.ts';
import { getToken } from './auth.ts';

export interface Installation {
  installation_id: number;
  account_login?: string;
}

export interface Repository {
  owner: string;
  repo: string;
  full_name: string;
}

export interface InstallationsResponse {
  items: Installation[];
}

export interface RepositoriesResponse {
  items: Repository[];
}

export interface ReadmeInfo {
  ref?: string;
  readme_path?: string;
}

export interface ReadmePayload {
  text: string;
  sha: string | null;
}

export interface FetchResponse<T> {
  ok: boolean;
  status: number;
  headers: Headers | null;
  data: T | null;
  text: string | null;
  error?: string;
}

export interface RepoSpec {
  rawUrl?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  path?: string;
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error('NETWORK_FAILURE');
  }
}

async function getJSON<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const url = new URL(`${BACKEND_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const token = getToken()?.value;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const r = await safeFetch(url, { method: 'GET', headers });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

export const discoverInstallations = (): Promise<InstallationsResponse> =>
  getJSON<InstallationsResponse>('/discover/installations');

export const discoverRepos = (installation_id: number): Promise<RepositoriesResponse> =>
  getJSON<RepositoriesResponse>('/discover/repos', { installation_id });

export const discoverReadme = (
  installation_id: number,
  owner: string,
  repo: string,
): Promise<ReadmeInfo> => getJSON<ReadmeInfo>('/discover/readme', { installation_id, owner, repo });

function b64ToText(b64: string): string {
  try {
    const bin = atob(b64.replace(/\s/g, ''));
    const bytes = new Uint8Array([...bin].map((ch) => ch.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    log('b64 decode error', e);
    return '';
  }
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const token = getToken()?.value;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await safeFetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status} ${r.statusText} — ${text}`);
  }
  return r.json() as Promise<T>;
}

export interface AnalyzeRepoParams {
  installation_id: number;
  owner: string;
  repo: string;
  ref?: string;
  readme_path?: string;
}

export async function analisarRepo({
  installation_id,
  owner,
  repo,
  ref = 'main',
  readme_path = 'README.md',
}: AnalyzeRepoParams): Promise<any> {
  return postJSON('/analisar', { installation_id, owner, repo, ref, readme_path });
}

export interface ProporPRParams {
  installation_id: number;
  owner: string;
  repo: string;
  base?: string;
  head: string;
  readme_path?: string;
  message: string;
  base_sha: string;
  new_content_utf8: string;
  labels?: string[];
  draft?: boolean;
}

export async function proporPR({
  installation_id,
  owner,
  repo,
  base = 'main',
  head,
  readme_path = 'README.md',
  message,
  base_sha,
  new_content_utf8,
  labels = ['docs', 'readme-studio'],
  draft = true,
}: ProporPRParams): Promise<any> {
  return postJSON('/propor-pr', {
    installation_id,
    owner,
    repo,
    base,
    head,
    readme_path,
    message,
    base_sha,
    new_content_utf8,
    labels,
    draft,
  });
}

async function fetchJSON<T>(url: string, token?: string): Promise<FetchResponse<T>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const r = await safeFetch(url, { headers, cache: 'no-store', mode: 'cors' });
    const text = await r.text();
    let data: T | null = null;
    try {
      data = JSON.parse(text) as T;
    } catch {}
    log('HTTP', r.status, url, (data as any)?.message || text.slice(0, 140));
    return { ok: r.ok, status: r.status, headers: r.headers, data, text };
  } catch (e: any) {
    if (e.message === 'NETWORK_FAILURE')
      return { ok: false, status: 0, headers: null, data: null, text: null, error: 'NETWORK_FAILURE' };
    throw e;
  }
}

async function tryRaw(
  owner: string,
  repo: string,
  branches: string[] = ['main', 'master', 'dev', 'stable'],
  paths: string[] = [
    'README.md',
    'Readme.md',
    'readme.md',
    'README',
    'README.pt-BR.md',
    'README.mdx',
    'docs/README.md',
  ],
): Promise<string> {
  for (const b of branches)
    for (const p of paths) {
      const ru = `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${p}?ts=${Date.now()}`;
      log('try RAW', ru);
      const rr = await safeFetch(ru, { cache: 'no-store', mode: 'cors' });
      if (rr.ok) return await rr.text();
    }
  throw new Error('RAW fallback falhou');
}

async function discoverDefaultBranch(owner: string, repo: string, token?: string): Promise<string> {
  const { ok, status, data, error } = await fetchJSON<any>(
    `https://api.github.com/repos/${owner}/${repo}`,
    token,
  );
  if (error === 'NETWORK_FAILURE') throw new Error('NETWORK_FAILURE');
  if (!ok) {
    if (status === 404) throw new Error('NOT_FOUND_REPO_OR_PRIVATE');
    throw new Error('Falha ao obter repo');
  }
  return (data as any)?.default_branch || 'main';
}

function apiLikelyBlocked(): boolean {
  return location.protocol === 'file:' || !/^https?:$/.test(location.protocol);
}

export function parseRepoSpec(spec: string): RepoSpec | null {
  spec = (spec || '').trim();
  if (!spec) return null;
  try {
    const u = new URL(spec);
    if (/raw\.githubusercontent\.com$/.test(u.hostname)) return { rawUrl: u.href };
    if (/github\.com$/.test(u.hostname)) {
      const p = u.pathname.split('/').filter(Boolean);
      const owner = p[0];
      const repo = p[1]?.replace(/\.git$/, '');
      if (!owner || !repo) return null;
      if (p[2] === 'blob' || p[2] === 'tree') {
        const branch = p[3];
        const path = p.slice(4).join('/');
        return { owner, repo, branch, path };
      }
      return { owner, repo };
    }
  } catch {}
  const m = spec.match(/^([\w.-]+)\/([\w.-]+)(?:@([^:]+))?(?::(.+))?$/);
  return m
    ? { owner: m[1], repo: m[2].replace(/\.git$/, ''), branch: m[3], path: m[4] }
    : null;
}

export async function fetchReadme(
  spec: RepoSpec,
  { forceRaw = false, token = getToken()?.value }: { forceRaw?: boolean; token?: string | null } = {},
): Promise<ReadmePayload> {
  if (!spec) throw new Error('Especificação inválida');

  if (spec.rawUrl) {
    const r = await safeFetch(spec.rawUrl, { cache: 'no-store', mode: 'cors' });
    if (!r.ok) throw new Error('Falha ao baixar RAW: ' + r.status);
    return { text: await r.text(), sha: null };
  }

  const { owner, repo } = spec;
  let { branch, path } = spec;
  const avoidAPI = apiLikelyBlocked();

  async function viaAPIReadme(): Promise<ReadmePayload> {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const finalUrl = branch ? `${url}?ref=${encodeURIComponent(branch)}` : url;
    const { ok, status, data, error } = await fetchJSON<any>(finalUrl, token || undefined);
    if (error === 'NETWORK_FAILURE') throw new Error('NETWORK_FAILURE');
    if (!ok) {
      if (status === 404) throw new Error('NOT_FOUND_REPO_OR_PRIVATE');
      if (status === 403 && /rate limit/i.test((data as any)?.message || ''))
        throw new Error('RATE_LIMIT');
      throw new Error(`API /readme falhou ${status}: ${(data as any)?.message || ''}`);
    }
    if (data?.content) return { text: b64ToText((data as any).content), sha: (data as any).sha };
    throw new Error('API não retornou conteúdo do README');
  }

  async function viaAPIContents(pth: string, ref: string): Promise<ReadmePayload> {
    const { ok, status, data, error } = await fetchJSON<any>(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(pth)}?ref=${encodeURIComponent(ref)}`,
      token || undefined,
    );
    if (error === 'NETWORK_FAILURE') throw new Error('NETWORK_FAILURE');
    if (ok && data?.content) return { text: b64ToText((data as any).content), sha: (data as any).sha };
    if (status === 404) throw new Error('NOT_FOUND_REPO_OR_PRIVATE');
    throw new Error('Arquivo não encontrado no repositório');
  }

  if (path) {
    const branches = branch ? [branch] : ['main', 'master', 'dev', 'stable'];
    if (token && !avoidAPI) {
      for (const b of branches) {
        try {
          return await viaAPIContents(path, b);
        } catch (e: any) {
          if (String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE')) throw e;
        }
      }
    }
    try {
      const txt = await tryRaw(owner!, repo!, branches, [path]);
      return { text: txt, sha: null };
    } catch (e: any) {
      if (e.message === 'NETWORK_FAILURE') throw e;
      if (token) throw e;
    }
  }

  if (owner && repo && !path) {
    if (token && !avoidAPI) {
      try {
        return await viaAPIReadme();
      } catch (e: any) {
        if (String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE')) throw e;
      }
    }
    if (forceRaw || avoidAPI) {
      const def =
        branch ||
        (await discoverDefaultBranch(owner, repo, token || undefined).catch((e) => {
          if (e.message === 'NETWORK_FAILURE') throw e;
          return 'main';
        }));
      const txt = await tryRaw(owner, repo, [def, 'main', 'master', 'dev', 'stable']);
      return { text: txt, sha: null };
    }
    try {
      return await viaAPIReadme();
    } catch (e: any) {
      if (
        String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE') ||
        e.message === 'NETWORK_FAILURE'
      )
        throw e;
      const def =
        branch ||
        (await discoverDefaultBranch(owner, repo, token || undefined).catch((e) => {
          if (e.message === 'NETWORK_FAILURE') throw e;
          return 'main';
        }));
      const txt = await tryRaw(owner, repo, [def, 'main', 'master']);
      return { text: txt, sha: null };
    }
  }

  throw new Error('Entrada não reconhecida');
}

export const __TESTING__ = { discoverDefaultBranch };

