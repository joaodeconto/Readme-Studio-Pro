# Codex Worklist — Mass Fix (Next 15, ESLint/TS)

> **Objetivo**: permitir que o agente (Codex/GPT‑5) resolva **em lote** os problemas de build/tipo do Next.js 15, ESLint e TS, com passos auditáveis e critérios de aceite. Use **1 PR por grupo** para facilitar revisão.

---

## 0) Pré‑voo (decisão estrutural)

* [ ] **Escolher 1 app root**: manter **`src/app`** **ou** `app` (apenas um).

  * **Detectar duplicatas**:

    ```bash
    git ls-files 'app/**/page.*' 'src/app/**/page.*'
    ```
  * **Ação**: remover duplicatas no root descartado.
* [ ] Limpar config inválida do Next:

  * Remover `experimental.serverActions` do `next.config.*` (já estável no 15).

**Aceite**: `pnpm build` não acusa 404 de rotas nem warning de config experimental.

---

## 1) ESLint base + regra para type‑imports

**Erro alvo**: `Failed to load config "next/core-web-vitals"` / imports de tipo sem `import type`.

* [ ] Garantir dev‑deps:

  ```bash
  pnpm add -D eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin
  ```
* [ ] Criar/ajustar **.eslintrc.cjs**:

  ```js
  // .eslintrc.cjs
  module.exports = {
    root: true,
    extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
    },
    ignorePatterns: ['.next/', 'node_modules/', 'dist/'],
  };
  ```
* [ ] Rodar lint e autofix:

  ```bash
  pnpm lint || pnpm eslint . --ext .ts,.tsx --fix
  ```

**Aceite**: lint passa localmente; imports de tipos usam `import type`.

---

## 2) Tipos do React e TSConfig

**Erro alvo**: `Could not find a declaration file for module 'react'`.

* [ ] Garantir dev‑deps:

  ```bash
  pnpm add -D @types/react@19 @types/react-dom@19
  ```
* [ ] Verificar `tsconfig.json`:

  ```json
  {
    "compilerOptions": {
      "jsx": "react-jsx"
    }
  }
  ```

**Aceite**: Type‑check não acusa falta de declarações do React.

---

## 3) Next 15 — `PageProps` e params **assíncronos**

**Erros alvo**: `Type '{ params: { ... } }' does not satisfy 'PageProps'`.

* [ ] **Auditar pages dinâmicas** com `params` síncrono ou destructuring:

  ```bash
  rg -n --glob '!node_modules' --glob '!*.d.ts' \
    'export default (async )?function Page\s*\(\s*\{?\s*params\s*:\s*\{' src/app app
  ```
* [ ] **Corrigir assinatura** para `PageProps` **ou** `params: Promise<...>` e usar `await`:

  ```tsx
  // Exemplo recomendado
  export default async function Page(props: PageProps<'/web/editor/[owner]/[repo]'>) {
    const { owner, repo } = await props.params;
    return <EditorPage owner={owner} repo={repo} />;
  }
  ```
* [ ] **Mover hooks** para componente **client**; pages ficam server (sem hooks). Ver §6.

**Aceite**: nenhum match na auditoria; build não acusa PageProps.

---

## 4) Next 15 — `RouteContext` e params **assíncronos** em API routes

**Erros alvo**: tipo inválido no segundo argumento do handler; acesso a `ctx.params` sem `await`.

* [ ] Auditar handlers dinâmicos:

  ```bash
  rg -n --glob '!node_modules' --glob '!*.d.ts' \
    'export async function (GET|POST|PUT|PATCH|DELETE)\(.*\{\s*params\s*:\s*\{' src/app app
  rg -n 'ctx\.params\.' src/app app
  ```
* [ ] Corrigir assinatura e uso:

  ```ts
  export async function GET(_req: Request, ctx: RouteContext<'/api/repos/[owner]/[repo]/readme'>) {
    const { owner, repo } = await ctx.params;
    // ...
  }
  ```

**Aceite**: nenhuma ocorrência de `ctx.params.` sem `await`.

---

## 5) Next 15 — `cookies()` / `headers()` são **Promises**

**Erro alvo**: `Property 'get' does not exist on type 'Promise<ReadonlyRequestCookies>'`.

* [ ] Auditar:

  ```bash
  rg -n "cookies\(\)\." src app
  rg -n "headers\(\)\." src app
  ```
* [ ] Corrigir padrão:

  ```ts
  const c = await cookies();
  const h = await headers();
  ```

**Aceite**: nenhuma chamada direta a `.get/.set` sem `await` prévio.

---

## 6) Hooks em `page.tsx` (App Router)

**Risco**: páginas são Server por padrão; hooks devem ficar em Client Components.

* [ ] Auditar hooks importados em pages:

  ```bash
  rg -n --glob '!node_modules' 'from\s+\'react\'\s*;?$' -C2 src/app app | rg 'use(State|Effect|Ref|Memo|Callback)'
  ```
* [ ] Padrão recomendado: **Server Page Wrapper** + **Client Shell**

  ```tsx
  // page.tsx (server)
  export default async function Page(props: PageProps<'/web/editor/[owner]/[repo]'>) {
    const { owner, repo } = await props.params;
    return <EditorPage owner={owner} repo={repo} />;
  }
  // EditorPage.tsx (client)
  'use client';
  // ... hooks aqui
  ```

**Aceite**: nenhum hook em `page.tsx` sem `use client` / ou movido para Shell.

---

## 7) Type‑only imports (ex.: conflito `Toast`)

**Erro alvo**: `Import 'X' conflicts with local value ... when 'isolatedModules' is enabled`.

* [ ] Auditar ocorrências comuns:

  ```bash
  rg -n --glob '!node_modules' "import\s*\{[^}]*\bToast\b[^}]*\}\s*from\s*'@ui/state/toast'"
  ```
* [ ] Corrigir imports dividindo valor e tipo:

  ```ts
  import { useToastStore, dismissToast } from '@ui/state/toast';
  import type { Toast, ToastVariant } from '@ui/state/toast';
  ```
* [ ] (Opcional) ESLint já reforça com `consistent-type-imports`.

**Aceite**: sem conflitos de nome entre tipos e valores.

---

## 8) Indexação segura de variantes (ex.: `variantStyles[t.variant]`)

**Erro alvo**: `Type 'undefined' cannot be used as an index type`.

* [ ] Normalizar chave antes de indexar:

  ```ts
  const variantStyles = { info: '...', success: '...', warn: '...', error: '...', default: '...' } as const;
  const key = (t.variant ?? 'default') as keyof typeof variantStyles;
  const cls = variantStyles[key];
  ```

**Aceite**: nenhum uso de index com `| undefined`.

---

## 9) GitHub Contents API — **Union narrowing**

**Erro alvo**: acesso a `data.content` sem checar `type`.

* [ ] Verificar rota `/api/github/file` e similares.
* [ ] Padrão correto:

  ```ts
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path, ref });
  if (Array.isArray(data)) { /* dir */ }
  else if (data.type === 'file') { /* usar data.content base64 */ }
  else if (data.type === 'symlink' || data.type === 'submodule') { /* ... */ }
  ```

**Aceite**: nenhum acesso direto a `content` sem `type` check.

---

## 10) Scripts de auditoria (executar em CI e local)

### 10.1 `scripts/audit-next15.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
FAIL=0

# Duplicatas de app roots
if git ls-files 'app/**/page.*' | grep -q . && git ls-files 'src/app/**/page.*' | grep -q .; then
  echo "❌ Duplicated app roots (app/ and src/app/)"; FAIL=1; fi

# PageProps/params sync
rg -n --glob '!node_modules' --glob '!*.d.ts' \
  'export default (async )?function Page\s*\(\s*\{?\s*params\s*:\s*\{' src/app app && { echo "❌ Pages com params síncrono"; FAIL=1; } || true

# RouteContext params sem await
rg -n 'ctx\.params\.' src/app app && { echo "❌ ctx.params usado sem await"; FAIL=1; } || true

# cookies()/headers() sem await
rg -n 'cookies\(\)\.(get|set|delete)' src app && { echo "❌ cookies() sem await"; FAIL=1; } || true
rg -n 'headers\(\)\.' src app && { echo "❌ headers() sem await"; FAIL=1; } || true

# Type-only imports (Toast exemplo)
rg -n "import\s*\{[^}]*\bToast\b[^}]*\}\s*from\s*'@ui/state/toast'" src app && { echo "❌ Toast import não-type"; FAIL=1; } || true

exit $FAIL
```

**Aceite**: script retorna `0` (verde) no CI.

---

## 11) Pipeline de validação

* [ ] `pnpm install`
* [ ] `pnpm lint --fix`
* [ ] `pnpm build`
* [ ] `bash scripts/audit-next15.sh`
* [ ] `bash scripts/smoke.sh` (já disponível)

**Aceite**: todos os passos verdes.

---

## 12) Política de PRs (para o agente)

* PR‑1: Estrutura e remoção de duplicatas (`src/app` único) + `next.config.*` sem experimentais.
* PR‑2: ESLint base + regra de type‑imports + autofix.
* PR‑3: PageProps (pages dinâmicas) + mover hooks p/ Client Shells.
* PR‑4: Route handlers (`RouteContext` + `await ctx.params`).
* PR‑5: cookies/headers await.
* PR‑6: GitHub Contents union narrowing.
* PR‑7: Scripts de auditoria + CI (opcional).

Cada PR deve conter: **o que foi feito**, **como testar**, **riscos/rollback**.

Codex Worklist — Mass Fix (Next 15, ESLint/TS) → backlog em 12 blocos, cada um com:

erro-alvo, comando de detecção, patch recomendado e critério de aceite;

inclui Next 15 (PageProps, RouteContext, cookies()/headers() como Promise), ESLint base, @types/react, hooks em pages, union narrowing do GitHub, e mais.

scripts/audit-next15.sh pronto para CI/local (detecta duplicatas de app roots, params síncrono, ctx.params sem await, cookies()/headers() sem await, imports de tipo).

Para cada PR, executar a Pipeline de validação do doc:

pnpm install
pnpm lint --fix
pnpm build
bash scripts/audit-next15.sh
bash scripts/smoke.sh


Em caso de erro, o agente deve anexar diffs e logs na descrição do PR.
