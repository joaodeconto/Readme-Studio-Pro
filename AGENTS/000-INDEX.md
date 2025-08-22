📌 Estrutura

agent_v1.md → Documento original, intacto.

/AGENTS/ → Pasta com agentes por domínio.

🤖 Agentes Ativos
agent_docs.md

Escopo: explicar e documentar

Responsabilidades:

Comentar códigos, ponderar decisões, compreender 

agent_ui.md

Escopo: migração do editor e UX.

Responsabilidades:

Atualizar layout, wireframes e UI.

Migrar toolbar/bindings legacy para React/Next.

Garantir acessibilidade e consistência visual.

agent_github.md

Escopo: integrações e webhooks com GitHub.

Responsabilidades:

Autenticação via GitHub App.

repository_dispatch, PRs e hooks.

Substituir chamadas diretas (fetch legacy).

agent_lint.md

Escopo: domínio markdown (TOC, lint, emoji).

Responsabilidades:

Lógica de lint e parser.

TOC automático.

Emojis inline e conversão.

agent_migration.md

Escopo: roteiro de substituição de legacy.

Responsabilidades:

Mapear código não modular.

Definir rota de migração.

Garantir compatibilidade com Next.js.

📖 Regras

Cada PR deve mencionar:

“Mudança guiada por agent_X”.

Se houver sobreposição, priorizar agent de domínio mais específico.

Agents podem se referenciar (ex.: UI chamando Lint).