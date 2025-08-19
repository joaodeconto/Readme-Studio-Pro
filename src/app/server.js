// app/server.js (ajustado)
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { App } from '@octokit/app';
import { Webhooks } from '@octokit/webhooks';
import { buildTOC, wrapTOC, applyTOCBlock } from '../utils/toc.js';
import {lintMarkdown, lintLinksAndImages,} from '../utils/lint.js';
// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseJsonBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
}

function proposeReadmeWithTOC(originalMd) {
  const { headings } = lintMarkdown(originalMd);
  const toc = buildTOC(
    headings.map((h) => ({ level: h.level, text: h.title, slug: h.anchor })),
    { minLevel: 1, maxLevel: 3 }
  );
  const tocBlock = wrapTOC(toc);
  const proposed = applyTOCBlock(originalMd, tocBlock, { position: 'top' });
  const changed = proposed !== originalMd;
  return { proposed, toc, changed };
}

// -----------------------------------------------------------------------------
// Fastify
// -----------------------------------------------------------------------------
const fastify = Fastify({ logger: false });

await fastify.register(cors, {
  origin: [
    'https://smee.io/fJBORalVygC60YcZ',                                // dev local (se servir estático)
    'https://joaodeconto.github.io'                         // seu GitHub Pages (raiz do user)
  ],
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400
});

// Parser "raw" APENAS para o webhook (GitHub precisa do corpo cru para validação de assinatura)
// Como truque simples e universal, deixamos tudo como string e convertemos manualmente nas rotas JSON (/analisar, /propor-pr)
fastify.addContentTypeParser('*', (req, payload, done) => {
  let data = '';
  payload.on('data', (c) => (data += c));
  payload.on('end', () => done(null, data));
});

fastify.get('/health', (_, r) => r.send({ ok: true }));

// -----------------------------------------------------------------------------
// Octokit App & Webhooks
// -----------------------------------------------------------------------------
const app = new App({
  appId: process.env.GH_APP_ID,
  privateKey: process.env.GH_APP_PRIVATE_KEY,
});

async function getClient(installationId) {
  return app.getInstallationOctokit(Number(installationId));
}

async function validateRelPaths(octo, { owner, repo, ref, readmeDir, items }) {
  const results = [];
  for (const it of items) {
    // normaliza ./ e junta com diretório do README (caso esteja em docs/README.md)
    const rel = it.url || it.href || it.src;
    const joined = (readmeDir ? `${readmeDir.replace(/\\/g, '/').replace(/\/$/, '')}/` : '') + rel.replace(/^.\//, '');
    try {
      await octo.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner, repo, path: joined, ref
      });
      results.push({ ...it, ok: true, resolved: joined });
    } catch (e) {
      results.push({ ...it, ok: false, resolved: joined });
    }
  }
  return results;
}

const webhooks = new Webhooks({ secret: process.env.GH_WEBHOOK_SECRET });

webhooks.onAny(({ id, name, payload }) => {
  console.log(`[${name}] delivery=${id} repo=${payload?.repository?.full_name ?? 'n/a'}`);
});

fastify.all('/webhooks/github', async (req, res) => {
  try {
    // req.body AQUI É STRING CRUA (por causa do parser acima)
    await webhooks.verifyAndReceive({
      id: req.headers['x-github-delivery'],
      name: req.headers['x-github-event'],
      signature: req.headers['x-hub-signature-256'],
      payload: req.body,
    });
    return res.send({ ok: true });
  } catch (err) {
    console.error('[webhook] error', err);
    res.code(400);
    return res.send({ ok: false, error: 'invalid webhook signature or payload' });
  }
});

// -----------------------------------------------------------------------------
// Rotas de API
// -----------------------------------------------------------------------------
fastify.post('/analisar', async (req, res) => {
  try {
    const body = parseJsonBody(req);
    const { installation_id, owner, repo, ref = 'main', readme_path = 'README.md' } = body;
    const octo = await getClient(installation_id);

    // Lê README
    const { data: file } = await octo.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: readme_path,
      ref,
    });
    const original = Buffer.from(file.content, 'base64').toString('utf8');

    // Gera proposta com TOC + lint
    const { proposed, toc, changed } = proposeReadmeWithTOC(original);
    const { issues, headings } = lintMarkdown(original);

    const readmeDir = readme_path.includes('/') ? readme_path.split('/').slice(0, -1).join('/') : '';


    const rel = lintLinksAndImages(original);

    const toCheck = [
      ...rel.links.map(l => ({ type: 'link', url: l.url || l.href })),
      ...rel.images.map(i => ({ type: 'img', url: i.url || i.src }))
    ].filter(i => i.url && !/^https?:\/\//i.test(i.url) && !i.url.startsWith('#'));

    // valida com a API
    const validated = await validateRelPaths(octo, { owner, repo, ref, readmeDir, items: toCheck });

    // acrescente nos findings
    const broken = validated.filter(v => !v.ok);


    const plan = [];
    if (changed) {
      const hadBlock = /<!--\s*readme-studio:toc:start\s*-->/i.test(original);
      plan.push({ op: hadBlock ? 'update_toc' : 'insert_toc', at: 'top' });
    }

    return res.send({
      findings: {
        headings: headings.length,
        toc: { lines: toc ? toc.split('\n').length : 0, changed },
        issues,
        relative_paths: {
          checked: validated.length,
          broken
        }
      },
      plan,
      preview: {
        patch_summary: changed ? 'TOC inserido/atualizado' : 'TOC já atualizado',
        new_content_utf8: proposed.slice(0, 2000),
      },
      base_sha: file.sha,
    });
  } catch (err) {
    console.error('[analisar] error', err);
    res.code(500);
    return res.send({ error: 'ANALISAR_FAILED', detail: String(err?.message ?? err) });
  }

});

fastify.post('/propor-pr', async (req, res) => {
  try {
    const body = parseJsonBody(req);
    const {
      installation_id,
      owner,
      repo,
      base = 'main',
      head = `readme-studio/update-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      readme_path = 'README.md',
      message = 'docs: atualiza README (TOC)',
      base_sha,
      new_content_utf8,
      labels = ['docs', 'readme-studio'],
      draft = true,
    } = body;

    if (!new_content_utf8 || !base_sha) {
      res.code(400);
      return res.send({ error: 'MISSING_FIELDS', detail: 'new_content_utf8 e base_sha são obrigatórios' });
    }

    const octo = await getClient(installation_id);

    // 1) Branch base
    const baseRef = await octo.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
      owner,
      repo,
      ref: `heads/${base}`,
    });

    // 2) Criar branch head
    await octo.request('POST /repos/{owner}/{repo}/git/refs', {
      owner,
      repo,
      ref: `refs/heads/${head}`,
      sha: baseRef.data.object.sha,
    });

    // 3) Aplicar alteração no README via Contents API
    await octo.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: readme_path,
      message,
      content: Buffer.from(new_content_utf8, 'utf8').toString('base64'),
      branch: head,
      sha: base_sha, // controle de concorrência
    });

    // 4) Abrir PR draft
    const pr = await octo.request('POST /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      title: message,
      head,
      base,
      draft,
    });

    // 5) (Opcional) adicionar labels
    try {
      await octo.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
        owner,
        repo,
        issue_number: pr.data.number,
        labels,
      });
    } catch (e) {
      // ignore se repo não tiver permissões/labels
    }    
    return res.send({ pr_number: pr.data.number, pr_url: pr.data.html_url, head_sha: pr.data.head.sha });

  } catch (err) {
    console.error('[propor-pr] error', err);
    res.code(500);
    return res.send({ error: 'PROPOR_PR_FAILED', detail: String(err?.message ?? err) });
  }
});

// -----------------------------------------------------------------------------
// Boot
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
fastify
  .listen({ port: PORT, host: HOST })
  .then(() => console.log(`Up on http://${HOST}:${PORT}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });



