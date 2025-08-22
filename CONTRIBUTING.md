# Guia de Contribuição

Agradecemos seu interesse em contribuir com o Readme Studio Pro!

## Requisitos
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8

## Como começar
1. Faça um fork do repositório e crie uma branch para sua feature ou correção.
2. Instale as dependências:
   ```bash
   pnpm install
   ```
3. Rode o ambiente local para validar sua mudança:
   ```bash
   pnpm dev
   ```
4. Execute linters e testes antes de enviar:
   ```bash
   pnpm lint
   pnpm test
   ```

## Convenções de Git
- Prefira mensagens de commit no formato Conventional Commits (`feat:`, `fix:`, `docs:`…).
- Mantenha commits focados e descrições claras.
- Atualize o [CHANGELOG](CHANGELOG.md) quando a alteração afetar usuários ou documentações.

## Pull Requests
- Descreva claramente o problema e a solução.
- Atualize a documentação relevante e cite arquivos modificados.
- Inclua "Mudança guiada por **agent_docs**" na descrição da PR.
- Aguarde aprovação de um mantenedor antes do merge.

## Estilo de Código e Docs
- Use TypeScript e siga os padrões configurados pelo projeto.
- Formate o código com `pnpm lint --fix` quando aplicável.
- Para documentações, siga as orientações em `AGENTS/agent_docs.md`.

## Reportando bugs e sugestões
- Abra uma issue descrevendo passos para reproduzir o problema ou detalhando a proposta.
- Sinta-se à vontade para anexar screenshots, logs ou links úteis.

## Código de Conduta
Ao contribuir, você concorda em seguir o [Código de Conduta](CODE_OF_CONDUCT.md).
