# Readme Studio Pro

**Para quê?**
Ferramenta de IA para gerar READMEs profissionais com integração ao GitHub.

## Como usar

1. Instale dependências e inicie o ambiente local.

```bash
pnpm install
pnpm dev
```

### Docs relacionados

- [CHANGELOG](CHANGELOG.md) — histórico de versões e marcos.
- [Guia de Contribuição](CONTRIBUTING.md) — passos para configurar ambiente e abrir PR.
- [Código de Conduta](CODE_OF_CONDUCT.md) — padrões de convivência.

- [Deploy](docs/deploy.md)
- [Pitch](docs/pitch.md)
- [validateRelPaths performance](docs/validateRelPaths-performance.md)

## Scripts

- `pnpm build` — gera build de produção.
- `pnpm start` — sobe o servidor com o build.
- `pnpm lint` — executa regras de lint.
- `pnpm test` — roda testes com Vitest.

## Decisões

- Next.js 15 para renderização e rotas.
- pnpm como gerenciador de pacotes.

## Testes

Execute os testes e linters locais:

```bash
pnpm lint
pnpm test
```
