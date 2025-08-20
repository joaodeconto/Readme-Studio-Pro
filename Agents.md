# Agents.md — Instruções para Agentes do Readme Studio Pro

## Objetivo do agente

* Auditar READMEs e arquivos correlatos.
* Sugerir/gerar melhorias (TOC, âncoras, links, imagens, badges, seções).
* Propor PRs **idempotentes** e **seguros** (nunca push direto em branch padrão).

---

## Entradas mínimas

* `installation_id` → via `/discover/installations`
* `owner`, `repo` → via `/discover/repos`
* `ref`, `readme_path` → via `/discover/readme`

---

## APIs do backend

* `GET /discover/installations`
* `GET /discover/repos?installation_id`
* `GET /discover/readme?installation_id&owner&repo`
* `POST /analisar`
* `POST /propor-pr`

---

## Princípios

* **Segurança**: nunca expor segredos; não logar conteúdo sensível.
* **Menor privilégio**: usar apenas escopos necessários (Contents\:RW, PRs\:RW, Metadata\:R).
* **Idempotência**: marcar blocos com `<!-- readme-studio:toc:start|end -->`.
* **Nunca** push direto na branch padrão → sempre PR draft.
* **Respeito ao estilo**: mudanças mínimas.

---

## Fluxo recomendado

### 1. Descoberta

1. `/discover/installations` → listar instalações.
2. `/discover/repos` → listar repositórios.
3. `/discover/readme` → obter `ref` e `readme_path`.

### 2. Análise

1. `POST /analisar`.
2. Exibir resultados:

   * headings, toc.changed, issues, relative\_paths.
   * preview comparado ao original.

### 3. Confirmação

* Mostrar toggles de escopo (TOC, links, headings, badges).

### 4. Propor PR

* Branch: `readme-studio/update-YYYYMMDD`.
* PR sempre draft.
* Commit msg: `docs: atualiza README (TOC)`.
* Labels: `docs`, `readme-studio`.

### 5. Pós-PR

* Opcional: check-run com resumo.
* Listar `relative_paths.broken` como comentário.

---

## Tratamento de erros

* **404**: App não instalado ou caminho incorreto → voltar ao passo Descoberta.
* **409**: `sha` desatualizado → refazer `/analisar`.
* **403**: permissões insuficientes → pedir instalação.
* **Rate limit**: aplicar backoff.
* **CORS**: alertar origem não permitida.

---

## Política de mudanças

* **TOC**: inserir se inexistente e ≥2 headings. Atualizar se `toc.changed`.
* **Âncoras**: relatar inconsistências, não renomear headings sem opt-in.
* **Links**: alertar links sem protocolo; validar relativos.
* **Badges**: propor com base em metadados.
* **Seções padrão**: sugerir se faltam (Instalação, Uso, Contribuição, Licença).

---

## Convenções

* **Branch**: `readme-studio/update-YYYYMMDD`.
* **PR**: draft, título `docs: atualiza README (TOC)`.
* **Labels**: `docs`, `readme-studio`.

---

## Privacidade & segurança

* Tokens só no backend.
* Não logar conteúdo de README/diffs.
* Sanitizar entradas do usuário.

---

## Observabilidade

* Métricas: análises, PRs, taxa toc.changed, erros.
* Logar apenas evento, repo, status, códigos HTTP.

---

## Reexecução

* Se PR já existe, comentar em vez de criar outro.
* Substituir apenas bloco TOC.

---

## UX (mensagens)

* Curto e direto.
* Explicar **o que** e **por quê**.
* Ex.: “Rodei o lint: 12 headings, TOC precisa atualização, 3 links quebrados.”

---

## Prompt interno

* Slugs no padrão GitHub.
* Não reescrever headings sem opt-in.
* Manter diffs pequenos.
* Texto em pt-BR.

---

## Fallbacks

* `/discover/readme` falhou? Usar GitHub API ou raw\.githubusercontent.
* Sem README? Propor scaffold mínimo só com opt-in.

---

## Rollout

* MVP: TOC + lint + PR draft.
* V1: validação relativa, cache ETag, labels.
* V1.1: check-run, multiarquivo, monorepo.

---

## Sinais de confirmação obrigatória

* README >5k linhas.
* Diffs >20% do arquivo.
* Repos com templates rígidos.

---
