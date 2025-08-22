// ./src/github/fetch.ts — minimal, focused fixes for typings & mapping
// ----------------------------------------------------------------------------
// 🔧 O objetivo é eliminar o erro de tipo no .map() de installations e corrigir
//    o shape de discoverRepos. Mantive a sua estrutura e nomes das funções.
//    As alterações são 100% compatíveis em tempo de execução.

import { Octokit } from 'octokit'
import { log } from '../utils/log'
import { getToken } from './auth'

// Lazily create an Octokit instance using the stored user token.
let cachedToken: string | null = null
let cachedOctokit: Octokit | null = null

// Tipos leves que refletem o que realmente usamos, permitindo nullables
// vindos da API do GitHub (account pode ser null em algumas situações).
// Não tentamos tipar o payload completo do Octokit aqui — apenas o necessário.

type InstallationLite = {
  id: number
  account: {
    login?: string
    name?: string | null
  } | null
}

type RepositoryLite = {
  id: number
  name: string
  owner: {
    login?: string
  } | null
}

function getOctokit(): Octokit {
  const token = getToken()
  if (!cachedOctokit || cachedToken !== token) {
    cachedToken = token || null
    cachedOctokit = new Octokit(token ? { auth: token } : {})
  }
  return cachedOctokit
}

function b64ToText(b64: string): string {
  try {
    const bin = atob(b64.replace(/\s/g, ''))
    const bytes = new Uint8Array([...bin].map((ch) => ch.charCodeAt(0)))
    return new TextDecoder('utf-8').decode(bytes)
  } catch (e) {
    log('b64 decode error', e)
    return ''
  }
}

export async function discoverInstallations(): Promise<{
  items: { installation_id: number; account_login?: string }[]
}> {
  try {
    const { data } = await getOctokit().request('GET /user/installations')

    // data.installations é uma lista; aqui usamos um tipo leve para mapear
    const items = (data.installations as unknown as InstallationLite[]).map((i) => ({
      installation_id: i.id,
      // ⚠️ GitHub prioriza `login` (org/user). `name` pode ser null/ausente.
      account_login: i.account?.login ?? i.account?.name ?? undefined,
    }))

    return { items }
  } catch (e: any) {
    if (!('status' in (e ?? {}))) throw new Error('NETWORK_FAILURE')
    throw e
  }
}

export async function discoverRepos(installation_id: number): Promise<{
  items: { owner: string; repo: string; full_name: string }[]
}> {
  try {
    const { data } = await getOctokit().request(
      'GET /user/installations/{installation_id}/repositories',
      { installation_id }
    )

    const items = (data.repositories as unknown as RepositoryLite[]).map((r) => {
      const owner = r.owner?.login ?? ''
      const repo = r.name // ✅ era `r.id` (number) — corrigido para `name` (string)
      const full_name = owner && repo ? `${owner}/${repo}` : repo
      return { owner, repo, full_name }
    })

    return { items }
  } catch (e: any) {
    if (!('status' in (e ?? {}))) throw new Error('NETWORK_FAILURE')
    throw e
  }
}

export async function discoverReadme(
  owner: string,
  repo: string
): Promise<{ ref?: string; readme_path?: string }> {
  try {
    const octokit = getOctokit()
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo })
    const ref = (repoData as any).default_branch || 'main'
    try {
      const { data: readme } = await octokit.rest.repos.getReadme({ owner, repo, ref })
      return { ref, readme_path: (readme as any).path }
    } catch (e: any) {
      if (e.status === 404) return { ref }
      throw e
    }
  } catch (e: any) {
    if (!('status' in (e ?? {}))) throw new Error('NETWORK_FAILURE')
    if (e.status === 404) throw new Error('NOT_FOUND_REPO_OR_PRIVATE')
    throw new Error('Falha ao obter repo')
  }
}

async function discoverDefaultBranch(owner: string, repo: string): Promise<string> {
  const octokit = getOctokit()
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo })
    return (data as any).default_branch || 'main'
  } catch (e: any) {
    if (!('status' in (e ?? {}))) throw new Error('NETWORK_FAILURE')
    if (e.status === 404) throw new Error('NOT_FOUND_REPO_OR_PRIVATE')
    throw new Error('Falha ao obter repo')
  }
}

function apiLikelyBlocked(): boolean {
  // Protege contra uso em ambiente sem `location` (SSR/Node)
  if (typeof location === 'undefined') return false
  return location.protocol === 'file:' || !/^https?:$/.test(location.protocol)
}

export function parseRepoSpec(spec: string): {
  owner?: string
  repo?: string
  branch?: string
  path?: string
  rawUrl?: string
} | null {
  spec = (spec || '').trim()
  if (!spec) return null
  try {
    const u = new URL(spec)
    if (/raw\.githubusercontent\.com$/.test(u.hostname)) return { rawUrl: u.href }
    if (/github\.com$/.test(u.hostname)) {
      const p = u.pathname.split('/').filter(Boolean)
      const owner = p[0]
      const repo = p[1]?.replace(/\.git$/, '')
      if (!owner || !repo) return null
      if (p[2] === 'blob' || p[2] === 'tree') {
        const branch = p[3]
        const path = p.slice(4).join('/')
        return { owner, repo, branch, path }
      }
      return { owner, repo }
    }
  } catch {}
  const m = spec.match(/^[\w.-]+\/[\w.-]+(?:@([^:]+))?(?::(.+))?$/)
  return m
    ? { owner: spec.split('/')[0], repo: spec.split('/')[1].replace(/\.git$/, ''), branch: m[1], path: m[2] }
    : null
}

async function tryRaw(
  owner: string,
  repo: string,
  branches: string[] = ['main', 'master', 'dev', 'stable'],
  paths: string[] = ['README.md', 'Readme.md', 'readme.md', 'README', 'README.pt-BR.md', 'README.mdx', 'docs/README.md']
): Promise<string> {
  for (const b of branches) for (const p of paths) {
    const ru = `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${p}?ts=${Date.now()}`
    log('try RAW', ru)
    try {
      const rr = await fetch(ru, { cache: 'no-store', mode: 'cors' })
      if (rr.ok) return await rr.text()
    } catch {
      throw new Error('NETWORK_FAILURE')
    }
  }
  throw new Error('RAW fallback falhou')
}

export async function fetchReadme(
  spec: {
    rawUrl?: string
    owner?: string
    repo?: string
    branch?: string
    path?: string
  },
  { forceRaw = false }: { forceRaw?: boolean } = {}
): Promise<{ text: string; sha: string | null }> {
  if (!spec) throw new Error('Especificação inválida')

  if (spec.rawUrl) {
    try {
      const r = await fetch(spec.rawUrl, { cache: 'no-store', mode: 'cors' })
      if (!r.ok) throw new Error('Falha ao baixar RAW: ' + r.status)
      return { text: await r.text(), sha: null }
    } catch {
      throw new Error('NETWORK_FAILURE')
    }
  }

  const { owner, repo } = spec
  let { branch, path } = spec
  const avoidAPI = apiLikelyBlocked()

  const octokit = getOctokit()

  async function viaAPIReadme() {
    const { data } = await octokit.rest.repos.getReadme({ owner: owner!, repo: repo!, ref: branch })
    if ((data as any).content) return { text: b64ToText((data as any).content), sha: (data as any).sha }
    throw new Error('API não retornou conteúdo do README')
  }

  async function viaAPIContents(pth: string, ref: string) {
    const { data } = await octokit.rest.repos.getContent({ owner: owner!, repo: repo!, path: pth, ref })
    if ('content' in (data as any) && typeof (data as any).content === 'string') {
      return { text: b64ToText((data as any).content), sha: (data as any).sha ?? null }
    }
    throw new Error('Arquivo não encontrado no repositório')
  }

  if (path) {
    const branches = branch ? [branch] : ['main', 'master', 'dev', 'stable']
    if (!avoidAPI) {
      for (const b of branches) {
        try {
          return await viaAPIContents(path, b)
        } catch (e: any) {
          if (String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE')) throw e
        }
      }
    }
    const txt = await tryRaw(owner!, repo!, branches, [path])
    return { text: txt, sha: null }
  }

  if (owner && repo && !path) {
    if (!avoidAPI) {
      try {
        return await viaAPIReadme()
      } catch (e: any) {
        if (String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE')) throw e
      }
    }
    if (forceRaw || avoidAPI) {
      const def =
        branch ||
        (await discoverDefaultBranch(owner, repo).catch((e) => {
          if ((e as Error).message === 'NETWORK_FAILURE') throw e
          return 'main'
        }))
      const txt = await tryRaw(owner, repo, [def, 'main', 'master', 'dev', 'stable'])
      return { text: txt, sha: null }
    }
    try {
      return await viaAPIReadme()
    } catch (e: any) {
      if (String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE') || e.message === 'NETWORK_FAILURE') throw e
      const def =
        branch ||
        (await discoverDefaultBranch(owner, repo).catch((err) => {
          if ((err as Error).message === 'NETWORK_FAILURE') throw err
          return 'main'
        }))
      const txt = await tryRaw(owner, repo, [def, 'main', 'master'])
      return { text: txt, sha: null }
    }
  }

  throw new Error('Entrada não reconhecida')
}

export const __TESTING__ = { discoverDefaultBranch }
