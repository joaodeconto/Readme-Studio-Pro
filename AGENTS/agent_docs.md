# 🤖 Agent Docs — Documentação & Comentários

* **Domínio:** Documentação de produto e técnica (READMEs, guias de uso, ADRs), comentários de código (TSDoc/JSDoc), changelog e padrões de escrita.
* **Escopo/Tarefa Atual:** *\[preencher — ex.: padronizar README do editor e comentar hooks críticos]*

> Princípios do time: passos lentos e explicações claras; código bem documentado; scripts modulares; preferir abrir conteúdo em canvas quando longo; sugerir uso de outro agente quando a integração for complexa.

---

## 🎯 Objetivos

1. Tornar o repositório **autoexplicativo** para devs e não devs.
2. Garantir **comentários úteis** (por quê/decisão) e não óbvios (o que já está no código).
3. Manter **padrões de documentação** consistentes em todo o projeto.
4. Fazer a **ponte** entre UX/Produto e implementação (diagramas, exemplos, checklists).

---

## 📚 Entregáveis

* **READMEs** por pacote/módulo (níveis: raiz, app, lib/*, features/*).
* **Comentários de código** com **TSDoc/JSDoc** (interfaces, funções públicas, hooks).
* **ADRs** (Architecture Decision Records) para decisões relevantes.
* **CHANGELOG** (semver; formato Keep a Changelog).
* **Guia de Contribuição** (CONTRIBUTING.md) e **Código de Conduta** (CODE\_OF\_CONDUCT.md).
* **Playbooks** curtos (runbooks) para tarefas operacionais.

---

## 🔎 Fluxo de Trabalho do Agent

1. **Descoberta/Reuso**

   * Procurar docs existentes antes de criar: `README.md`, `/docs/*`, comentários, issues/PRs.
   * Se houver documento similar **legacy**, planejar **substituição incremental** (deprecate, linkar, migrar conteúdo).
2. **Planejamento**

   * Definir **público-alvo** (dev, maintainer, produto).
   * Escolher **formato** (README, ADR, guia, comentário TSDoc) e **nível** (raiz vs módulo).
3. **Escrita/Comentário**

   * Produzir em **Markdown claro**, com exemplos executáveis e blocos de código curtos.
   * Comentários de código com **TSDoc** (ver seção de Padrões).
4. **Validação**

   * Rodar **linters** de Markdown e links; validar exemplos.
5. **Integração**

   * Referenciar docs nos PRs; atualizar **000-INDEX.md** e **CHANGELOG** quando aplicável.

---

## 🧩 Padrões de Comentários (TSDoc/JSDoc)

* Comentar **APENAS** o que agrega contexto: o **porquê**, trade-offs, complexidade, invariantes.
* Evitar comentar o óbvio (nome + tipo já dizem o quê).
* Preferir **TSDoc**:

```ts
/**
 * Converte Markdown em HTML seguro.
 * @param text Conteúdo Markdown.
 * @param opts Opções de renderização (ex.: emojify, sanitize).
 * @returns HTML sanitizado pronto para preview.
 */
export function renderMarkdown(text: string, opts?: RenderOpts): string { /* ... */ }
```

* Para hooks:

```ts
/** Hook de atalhos do editor (Ctrl+B/H/L/T/M). */
export function useEditorShortcuts(ref: RefObject<HTMLTextAreaElement>, handlers: Handlers) { /* ... */ }
```

---

## ✍️ Guia de Escrita (Docs)

* **Tom**: claro, direto, exemplos primeiro.
* **Estrutura**: objetivo → como usar → exemplo → decisões/caveats → próximos passos.
* **Diagramas**: usar Mermaid quando ajudar.
* **Idiomas**: PT como padrão; se público externo, PT/EN lado a lado nas seções principais.
* **Acessibilidade**: headings hierárquicos, listas curtas, tabelas quando houver parâmetros.

### Template de README de Módulo

````md
# <nome-do-módulo>

**Para quê?**
Breve descrição do problema que resolve.

## Como usar
```ts
// exemplo mínimo de import/uso
````

## API

* `funçãoA(x: T): R` — o que faz, quando usar.
* `funçãoB(...)` — notas importantes.

## Decisões

* Por que escolhemos <lib> / trade-offs.

## Testes

Como rodar e o que cobrem.

````

### Template de ADR
```md
# ADR-<número>: <título>
- Data: YYYY-MM-DD
- Status: proposta | aceita | deprecada
- Contexto: <problema/constraints>
- Decisão: <o que foi decidido>
- Consequências: <positivas/negativas>
- Alternativas consideradas: <lista>
````

### Template de PR (Documentação)

```md
### Tipo
- [ ] Docs
- [ ] Comentários Código

### Motivo
<qual lacuna resolveu>

### Mudanças
- README em <pasta>
- Comentários em <arquivo.ts>

### Agent
Mudança guiada por **agent_docs**.
```

---

## 🧰 Ferramentas e Linters

* **markdownlint** + **prettier** (formatação MD).
* **remark-lint** (+ `lint-no-dead-urls` para links).
* **typedoc** (gerar docs de API TS quando útil).
* **tsdoc** checker (consistência dos comentários).
* **doctest** simples para exemplos (quando aplicável).

### Scripts sugeridos

```json
{
  "scripts": {
    "docs:lint": "remark . -qf",
    "docs:fmt": "prettier --write \"**/*.{md,mdx}\"",
    "docs:build": "typedoc",
    "docs:check": "npm run docs:fmt && npm run docs:lint"
  }
}
```

---

## ✅ Checklist por PR

* [ ] Procurou docs/comentários existentes para reuso?
* [ ] Atualizou/Deprecou docs legacy correlatos?
* [ ] Comentou **APIs públicas** e **hooks** novos/alterados?
* [ ] README do módulo atualizado (exemplos testados)?
* [ ] Links verificados (sem 404)?
* [ ] CHANGELOG atualizado, se aplicável?
* [ ] PR cita: “Mudança guiada por **agent\_docs**”.

---

## 🔐 Qualidade & Segurança

* Não expor segredos/ENV em docs.
* Sanitizar exemplos que fazem chamadas externas.
* Marcar como **experimental** features instáveis.

---

## 🔗 Integração com outros Agents

* **agent\_ui**: screenshots, GIFs curtos, secções de UX nas docs.
* **agent\_lint**: especificar regras/documentar lint e mensagens.
* **agent\_github**: exemplos de PR flow e permissões.
* **agent\_migration**: ADRs para trocas de libs/arquitetura.

---

## 🧭 Onde colocar cada coisa

* Docs globais: `/docs/*` e README raiz.
* Docs por módulo: `*/README.md` dentro da pasta do módulo.
* ADRs: `/docs/adr/ADR-<número>-<slug>.md`.
* Comentários: no próprio código (TSDoc/JSDoc).
* Changelog: `CHANGELOG.md` na raiz.

---

## 🗺️ Roadmap (sugestão)

* [ ] Mapear módulos sem README.
* [ ] Criar ADR inicial: “Migração do editor para React idiomático”.
* [ ] Padronizar TSDoc em `lib/md/*` e `lib/github/*`.
* [ ] Ativar `remark-lint` + `markdownlint`.
* [ ] Criar guia “Como contribuir” (flows de PR, agents, convenções).
