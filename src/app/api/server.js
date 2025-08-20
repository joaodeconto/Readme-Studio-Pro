// app/server.js — Readme Studio Pro (final)
// Comentários curtos e objetivos.

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { App } from '@octokit/app';
import { Webhooks } from '@octokit/webhooks';
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';

// Utils do projeto
import { buildTOC, wrapTOC, applyTOCBlock } from '../../utils/toc.js';
import { lintMarkdown, lintLinksAndImages } from '../../utils/lint.js';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function parseJsonBody(req) { // body pode vir como string (parser raw)
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (err) {
      return { error: 'INVALID_JSON', detail: String(err?.message ?? err) };
    }
  }
  return req.body;
}

function proposeReadmeWithTOC(originalMd) { // gera TOC + aplica bloco idempotente
  const { headings } = lintMarkdown(originalMd);
  const toc = buildTOC(
    headings.map(h => ({ level: h.level, text: h.title, slug: h.anchor })),
    { minLevel: 1, maxLevel: 3 }
  );
  const tocBlock = wrapTOC(toc);
  const proposed = applyTOCBlock(originalMd, tocBlock, { position: 'top' });
  return { proposed, toc, changed: proposed !== originalMd };
}

async function validateRelPaths(octo, { owner, repo, ref, readmeDir, items }) {
  // Valida links/imagens relativos com Contents API
  const base = readmeDir ? `${readmeDir.replace(/\\/g, '/').replace(/\/$/, '')}/` : '';
  const checks = items.map(it => {
    const rel = it.url || it.href || it.src;
    const joined = base + rel.replace(/^\.\//, '');
    return octo
      .request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path: joined, ref })
      .then(() => ({ ...it, ok: true, resolved: joined }))
      .catch(() => ({ ...it, ok: false, resolved: joined }));
  });
  return Promise.all(checks);
}

// -----------------------------------------------------------------------------
// Fastify
// -----------------------------------------------------------------------------
const fastify = Fastify({ logger: false });

await fastify.register(cors, {
  origin: (origin, cb) => {
    // Sem Origin (ex.: curl) → libera
    if (!origin) return cb(null, true);
    const allow = new Set([
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'https://joaodeconto.github.io',
    ]);
    if (allow.has(origin)) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'), false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
});

// Parser raw (webhook precisa do corpo cru). Rotas JSON usam parseJsonBody.
fastify.addContentTypeParser('*', (req, payload, done) => {
  let data = '';
  payload.on('data', c => (data += c));
  payload.on('end', () => done(null, data));
});

fastify.get('/health', (_, r) => r.send({ ok: true }));

// -----------------------------------------------------------------------------
// Octokit App & Webhooks
// -----------------------------------------------------------------------------
const app = new App({ // normaliza privateKey com \n
  appId: Number(process.env.GH_APP_ID),
  privateKey: (process.env.GH_APP_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
});

async function getClient(installationId) { // token curto por instalação
  return app.getInstallationOctokit(Number(installationId));
}

const webhooks = new Webhooks({ secret: process.env.GH_WEBHOOK_SECRET });
webhooks.onAny(({ id, name, payload }) => {
  console.log(`[${name}] delivery=${id} repo=${payload?.repository?.full_name ?? 'n/a'}`);
});

fastify.all('/webhooks/github', async (req, res) => {
  try {
    await webhooks.verifyAndReceive({
      id: req.headers['x-github-delivery'],
      name: req.headers['x-github-event'],
      signature: req.headers['x-hub-signature-256'],
      payload: req.body, // string crua
    });
    return res.send({ ok: true });
  } catch (err) {
    console.error('[webhook] error', err);
    return res.code(400).send({ ok: false, error: 'invalid webhook signature or payload' });
  }
});

// -----------------------------------------------------------------------------
// Discover (zero digitação para o usuário)
// -----------------------------------------------------------------------------
fastify.get('/discover/installations', async (req, res) => {
  try {
    const octoApp = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: Number(process.env.GH_APP_ID),
        privateKey: (process.env.GH_APP_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      },
    });
    const { data } = await octoApp.request('GET /app/installations', { per_page: 100 });
    const items = data.map(it => ({
      installation_id: it.id,
      account_login: it.account?.login,
      account_type: it.account?.type,
      target_type: it.target_type,
      repository_selection: it.repository_selection,
    }));
    res.send({ items });
  } catch (e) {
    console.error('[discover/installations]', e);
    res.code(500).send({ error: 'DISCOVER_INSTALLATIONS_FAILED', detail: String(e?.message ?? e) });
  }
});

fastify.get('/discover/repos', async (req, res) => {
  try {
    const installation_id = Number(new URL(req.url, `http://${req.headers.host}`).searchParams.get('installation_id'));
    if (!installation_id) return res.code(400).send({ error: 'MISSING_installation_id' });
    const octo = await getClient(installation_id);
    const out = [];
    let page = 1;
    while (true) {
      const resp = await octo.request('GET /installation/repositories', { per_page: 100, page });
      out.push(...resp.data.repositories.map(r => ({
        owner: r.owner.login,
        repo: r.name,
        full_name: r.full_name,
        private: r.private,
        default_branch: r.default_branch,
      })));
      if (resp.data.repositories.length < 100) break;
      page += 1;
    }
    res.send({ items: out });
  } catch (e) {
    console.error('[discover/repos]', e);
    res.code(500).send({ error: 'DISCOVER_REPOS_FAILED', detail: String(e?.message ?? e) });
  }
});

fastify.get('/discover/readme', async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const installation_id = Number(url.searchParams.get('installation_id'));
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');
    if (!installation_id || !owner || !repo) {
      return res.code(400).send({ error: 'MISSING_PARAMS', detail: 'installation_id, owner, repo' });
    }
    const octo = await getClient(installation_id);
    const { data: repoInfo } = await octo.request('GET /repos/{owner}/{repo}', { owner, repo });
    const ref = repoInfo.default_branch || 'main';
    const candidates = ['README.md', 'README.MD', 'Readme.md', 'readme.md', 'docs/README.md', '.github/README.md'];
    let readme_path = null;
    for (const path of candidates) {
      try { await octo.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path, ref }); readme_path = path; break; } catch { }
    }
    if (!readme_path) {
      try { const r = await octo.request('GET /repos/{owner}/{repo}/readme', { owner, repo, ref }); readme_path = r.data.path || 'README.md'; } catch { }
    }
    res.send({ ref, readme_path });
  } catch (e) {
    console.error('[discover/readme]', e);
    res.code(500).send({ error: 'DISCOVER_README_FAILED', detail: String(e?.message ?? e) });
  }
});

// -----------------------------------------------------------------------------
// API: analisar → preview; propor-pr → PR draft
// -----------------------------------------------------------------------------
fastify.post('/analisar', async (req, res) => {
  try {
    const body = parseJsonBody(req);
    if (body?.error) return res.code(400).send(body);
    const { installation_id, owner, repo, ref = 'main', readme_path = 'README.md' } = body;
    const octo = await getClient(installation_id);
    const { data: file } = await octo.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path: readme_path, ref });
    const original = Buffer.from(file.content, 'base64').toString('utf8');

    const { proposed, toc, changed } = proposeReadmeWithTOC(original);
    const { issues, headings } = lintMarkdown(original);

    const readmeDir = readme_path.includes('/') ? readme_path.split('/').slice(0, -1).join('/') : '';
    const rel = lintLinksAndImages(original);
    const toCheck = [
      ...rel.links.map(l => ({ type: 'link', url: l.url || l.href })),
      ...rel.images.map(i => ({ type: 'img', url: i.url || i.src })),
    ].filter(i => i.url && !/^https?:\/\//i.test(i.url) && !i.url.startsWith('#'));
    const validated = await validateRelPaths(octo, { owner, repo, ref, readmeDir, items: toCheck });
    const broken = validated.filter(v => !v.ok);

    return res.send({
      findings: {
        headings: headings.length,
        toc: { lines: toc ? toc.split('\n').length : 0, changed },
        issues,
        relative_paths: { checked: validated.length, broken },
      },
      plan: changed ? [{ op: /<!--\s*readme-studio:toc:start\s*-->/i.test(original) ? 'update_toc' : 'insert_toc', at: 'top' }] : [],
      preview: { patch_summary: changed ? 'TOC inserido/atualizado' : 'TOC já atualizado', new_content_utf8: proposed.slice(0, 2000) },
      base_sha: file.sha,
    });
  } catch (err) {
    console.error('[analisar] error', err);
    return res.code(500).send({ error: 'ANALISAR_FAILED', detail: String(err?.message ?? err) });
  }
});

fastify.post('/propor-pr', async (req, res) => {
  try {
    const body = parseJsonBody(req);
    if (body?.error) return res.code(400).send(body);
    const { installation_id, owner, repo, base = 'main', head = `readme-studio/update-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`, readme_path = 'README.md', message = 'docs: atualiza README (TOC)', base_sha, new_content_utf8, labels = ['docs', 'readme-studio'], draft = true } = body;

    if (!new_content_utf8 || !base_sha) return res.code(400).send({ error: 'MISSING_FIELDS', detail: 'new_content_utf8 e base_sha são obrigatórios' });
    const octo = await getClient(installation_id);

    const baseRef = await octo.request('GET /repos/{owner}/{repo}/git/ref/{ref}', { owner, repo, ref: `heads/${base}` });
    await octo.request('POST /repos/{owner}/{repo}/git/refs', { owner, repo, ref: `refs/heads/${head}`, sha: baseRef.data.object.sha });

    await octo.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner, repo, path: readme_path, message,
      content: Buffer.from(new_content_utf8, 'utf8').toString('base64'),
      branch: head, sha: base_sha,
    });

    const pr = await octo.request('POST /repos/{owner}/{repo}/pulls', { owner, repo, title: message, head, base, draft });
    try {
      await octo.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', { owner, repo, issue_number: pr.data.number, labels });
    } catch { }

    return res.send({ pr_number: pr.data.number, pr_url: pr.data.html_url, head_sha: pr.data.head.sha });
  } catch (err) {
    console.error('[propor-pr] error', err);
    return res.code(500).send({ error: 'PROPOR_PR_FAILED', detail: String(err?.message ?? err) });
  }
});

// -----------------------------------------------------------------------------
// Boot (depois de TODAS as rotas)
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Render/containers
fastify
  .listen({ port: PORT, host: HOST })
  .then(() => console.log(`Up on http://${HOST}:${PORT}`))
  .catch(err => { console.error(err); process.exit(1); });
