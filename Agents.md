👤 Personas

Maker: contribuidor, quer criar/editar READMEs rapidamente.

Visitor: acessa pré-visualizações, dá feedback, sem permissão de escrita.

Maintainer: revisa PRs abertos pelo app.

🗺️ Fluxo do Usuário

Landing → conectar GitHub App ou testar demo.

Auth → instalação do GitHub App (ou modo offline limitado).

Repo Picker → busca/repos recentes, público ou privado.

Editor Workspace

Editor Markdown + Preview.

Paleta de blocos padrão (Badges, Instalação, Uso, etc).

Snippets inteligentes (códigos, JSON, callouts).

AI Assist (melhorar clareza, TOC com emojis, tradução, etc).

Lint (links, imagens, badges).

Preview Modes → GitHub/DOCs, light/dark, mobile/desktop.

Commit/PR → branch + PR gerado (com template).

Share → link read-only de preview ou export Markdown/ZIP.

Dashboard → reabrir drafts, PRs pendentes, quick actions.

🏗️ Arquitetura Técnica

Next.js App Router: UI + APIs em /app/api/*.

GitHub App: autenticação via installation tokens + webhooks (/api/github/webhook).

DB: Postgres (via Prisma) para guardar installations/repos.

Jobs: Vercel Cron Jobs para sync periódico.

Observabilidade: PostHog (opcional).

📂 Estrutura Modular
app/
  (marketing)/         # Landing
  dashboard/           # Dashboard
  editor/[owner]/[repo]/  # Editor por repo
  api/github/          # Webhooks + OAuth
  api/repos/...        # Endpoints internos
lib/github/            # Helpers App/Tokens/Verify
lib/db/                # Prisma client

🔑 Variáveis de Ambiente

GITHUB_APP_ID, GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET

GITHUB_APP_WEBHOOK_SECRET

GITHUB_APP_PRIVATE_KEY_B64

DATABASE_URL (Postgres)

NEXT_PUBLIC_POSTHOG_KEY (opcional)

📋 Checklist de Agente (o que um AI deve fazer)
1. Infraestrutura

Garantir que pastas/rotas mínimas existam (dashboard, editor).

Validar ENV no Vercel antes do deploy.

Testar webhook com ping.

2. Integração GitHub App

Criar helper lib/github/app.ts para JWT.

Implementar troca JWT → installation token.

Validar assinatura de webhook (verify.ts).

Mapear installationId ↔ repo no DB.

3. Funcionalidades Core

Buscar README (/api/repos/[owner]/[repo]/readme).

Renderizar Editor + Preview.

AI hooks: TOC, clareza, badges.

Commit → branch + PR com template.

4. Fallbacks

Se repo privado sem permissão → mostrar card de instalação do App.

Se sem rights → fallback para fork + PR.

Se offline → drafts locais apenas.

5. Experiência

TOC com emojis (se ativado).

Validador de assets (evitar 404 em imagens).

Dashboard com “needs attention”.

📈 Roadmap

 Batch improve READMEs (múltiplos repos).

 Galeria de READMEs de referência.

 PR check bot para anchors/imagens.

 Org defaults (badges, licença).