import { log } from '../utils/log.js';
import { BACKEND_URL } from './config.js';


async function safeFetch(input, init){
  try{ return await fetch(input, init); }
  catch{ throw new Error('NETWORK_FAILURE'); }
}

async function getJSON(path, params) {
  const url = new URL(`${BACKEND_URL}${path}`);
  if (params) Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const r = await safeFetch(url, { method: 'GET' });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

export const discoverInstallations = () =>
  getJSON('/discover/installations');

export const discoverRepos = (installation_id) =>
  getJSON('/discover/repos', { installation_id });

export const discoverReadme = (installation_id, owner, repo) =>
  getJSON('/discover/readme', { installation_id, owner, repo });

function b64ToText(b64){
  try{ const bin=atob(b64.replace(/\s/g,'')); const bytes=new Uint8Array([...bin].map(ch=>ch.charCodeAt(0)));
       return new TextDecoder('utf-8').decode(bytes);
  }catch(e){ log('b64 decode error', e); return ''; }
}

async function postJSON(path, body) {
  const r = await safeFetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status} ${r.statusText} — ${text}`);
  }
  return r.json();
}

export async function analisarRepo({ installation_id, owner, repo, ref='main', readme_path='README.md' }) {
  return postJSON('/analisar', { installation_id, owner, repo, ref, readme_path });
}

export async function proporPR({ installation_id, owner, repo, base='main', head, readme_path='README.md', message, base_sha, new_content_utf8, labels=['docs','readme-studio'], draft=true }) {
  return postJSON('/propor-pr', { installation_id, owner, repo, base, head, readme_path, message, base_sha, new_content_utf8, labels, draft });
}

async function fetchJSON(url, token){
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try{
    const r = await safeFetch(url, { headers, cache: 'no-store', mode: 'cors' });
    const text = await r.text();
    let data = null; try { data = JSON.parse(text) } catch {}
    log('HTTP', r.status, url, data?.message || text.slice(0,140));
    return { ok: r.ok, status: r.status, headers: r.headers, data, text };
  }catch(e){
    if(e.message==='NETWORK_FAILURE') return { ok:false, status:0, headers:null, data:null, text:null, error:'NETWORK_FAILURE' };
    throw e;
  }
}

async function tryRaw(owner,repo,branches=['main','master','dev','stable'],paths=['README.md','Readme.md','readme.md','README','README.pt-BR.md','README.mdx','docs/README.md']){
  for(const b of branches) for(const p of paths){
    const ru=`https://raw.githubusercontent.com/${owner}/${repo}/${b}/${p}?ts=${Date.now()}`;
    log('try RAW', ru);
    const rr=await safeFetch(ru,{cache:'no-store',mode:'cors'});
    if (rr.ok) return await rr.text();
  }
  throw new Error('RAW fallback falhou');
}

async function discoverDefaultBranch(owner,repo,token){
  const {ok,status,error}=await fetchJSON(`https://api.github.com/repos/${owner}/${repo}`, token);
  if(error==='NETWORK_FAILURE') throw new Error('NETWORK_FAILURE');
  if(!ok){ if(status===404) throw new Error('NOT_FOUND_REPO_OR_PRIVATE'); throw new Error('Falha ao obter repo'); }
  // nota: não precisamos do default_branch aqui se fallback funcionar
  return 'main';
}

function apiLikelyBlocked(){ return location.protocol==='file:' || !/^https?:$/.test(location.protocol); }

export function parseRepoSpec(spec){
  spec=(spec||'').trim(); if(!spec) return null;
  try{
    const u=new URL(spec);
    if(/raw\.githubusercontent\.com$/.test(u.hostname)) return { rawUrl:u.href };
    if(/github\.com$/.test(u.hostname)){
      const p=u.pathname.split('/').filter(Boolean); const owner=p[0], repo=p[1];
      if(!owner||!repo) return null;
      if(p[2]==='blob'||p[2]==='tree'){ const branch=p[3]; const path=p.slice(4).join('/'); return { owner, repo, branch, path }; }
      return { owner, repo };
    }
  }catch{}
  const m=spec.match(/^([\w.-]+)\/([\w.-]+)(?:@([^:]+))?(?::(.+))?$/);
  return m ? { owner:m[1], repo:m[2], branch:m[3], path:m[4] } : null;
}

export async function fetchReadme(spec,{forceRaw=false, token}={}){
  if(!spec) throw new Error('Especificação inválida');

  if(spec.rawUrl){
    const r=await safeFetch(spec.rawUrl,{cache:'no-store',mode:'cors'});
    if(!r.ok) throw new Error('Falha ao baixar RAW: '+r.status);
    return await r.text();
  }

  const {owner,repo}=spec; let {branch,path}=spec;
  const avoidAPI = apiLikelyBlocked();

  async function viaAPIReadme(){
    const url=`https://api.github.com/repos/${owner}/${repo}/readme${branch?`?ref=${encodeURIComponent(branch)}`:''}`;
    const {ok,status,data,error}=await fetchJSON(url, token);
    if(error==='NETWORK_FAILURE') throw new Error('NETWORK_FAILURE');
    if(!ok){
      if (status===404) throw new Error('NOT_FOUND_REPO_OR_PRIVATE');
      if (status===403 && /rate limit/i.test(data?.message||'')) throw new Error('RATE_LIMIT');
      throw new Error(`API /readme falhou ${status}: ${data?.message||''}`);
    }
    if(data?.content) return b64ToText(data.content);
    throw new Error('API não retornou conteúdo do README');
  }

  async function viaAPIContents(pth, ref){
    const {ok,status,data,error}=await fetchJSON(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(pth)}?ref=${encodeURIComponent(ref)}`, token);
    if(error==='NETWORK_FAILURE') throw new Error('NETWORK_FAILURE');
    if(ok && data?.content) return b64ToText(data.content);
    if(status===404) throw new Error('NOT_FOUND_REPO_OR_PRIVATE');
    throw new Error('Arquivo não encontrado no repositório');
  }

  if (path){ // caminho explícito
    const branches = branch ? [branch] : ['main','master','dev','stable'];
    if (token && !avoidAPI){
      for (const b of branches){ try { return await viaAPIContents(path, b); } catch(e){ if(String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE')) throw e; } }
    }
    try { return await tryRaw(owner,repo,branches,[path]); } catch(e){ if (e.message==='NETWORK_FAILURE') throw e; if (token) throw e; }
  }

  if (owner && repo && !path){
    if (token && !avoidAPI){
      try { return await viaAPIReadme(); } catch(e){ if(String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE')) throw e; }
    }
    if (forceRaw || avoidAPI){
      const def = branch || (await discoverDefaultBranch(owner,repo, token).catch(e=>{
        if(e.message==='NETWORK_FAILURE') throw e;
        return 'main';
      }));
      return tryRaw(owner,repo,[def,'main','master','dev','stable']);
    }
    try { return await viaAPIReadme(); }
    catch(e){
      if (String(e.message).includes('NOT_FOUND_REPO_OR_PRIVATE') || e.message==='NETWORK_FAILURE') throw e;
      const def = branch || (await discoverDefaultBranch(owner,repo, token).catch(e=>{
        if(e.message==='NETWORK_FAILURE') throw e;
        return 'main';
      }));
      return tryRaw(owner,repo,[def,'main','master']);
    }
  }

  throw new Error('Entrada não reconhecida');
}
