# Tutorial de Deploy

Este guia explica como publicar o Readme Studio Pro em um ambiente de produção.

## Pré-requisitos

- Node.js 20+
- Conta no [Vercel](https://vercel.com) ou acesso a um servidor com Node.js

## Passos

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/SEU_USUARIO/Readme-Studio-Pro.git
   cd Readme-Studio-Pro
   ```
2. **Instalar dependências**
   ```bash
   npm install
   ```
3. **Configurar variáveis de ambiente**
   Crie um arquivo `.env` com as chaves necessárias. Exemplo:
   ```env
   READMESTUDIO_BACKEND_URL=http://localhost:3001
   ```
4. **Gerar build de produção**
   ```bash
   npm run build
   ```
5. **Iniciar o servidor**
   ```bash
   npm start
   ```
6. **Deploy no Vercel (opcional)**
   - Instale a CLI: `npm i -g vercel`
   - Execute `vercel` e siga as instruções.

Após o deploy, a aplicação estará disponível na URL gerada.
