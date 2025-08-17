// Modelos prontos de README por stack
export const TPL = {
  node: `# Nome do Projeto (Node.js)

[![node](https://img.shields.io/badge/runtime-Node.js-43853d?logo=node.js&logoColor=white)](#) [![license](https://img.shields.io/badge/license-MIT-blue)](#)

> Pitch curto: o que faz, para quem e por quê.

## Instalação

\`\`\`bash
npm i
# ou
yarn
\`\`\`

## Uso

\`\`\`bash
npm run start
\`\`\`

## Configuração
Crie um arquivo \`.env\` com as variáveis necessárias.

## Scripts
- \`build\`: compila
- \`test\`: roda testes

## Roadmap
- [ ] Feature 1
- [ ] Feature 2

## Licença
MIT © Seu Nome
`,
  python: `# Nome do Projeto (Python)

[![python](https://img.shields.io/badge/python-3.11+-3776AB?logo=python&logoColor=white)](#) [![license](https://img.shields.io/badge/license-MIT-blue)](#)

## Instalação

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Uso

\`\`\`bash
python -m pacote --help
\`\`\`

## Exemplos

\`\`\`py
from pacote import main
main()
\`\`\`

## Licença
MIT
`,
  dotnet: `# Nome do Projeto (.NET)

[![dotnet](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](#)

## Build

\`\`\`bash
dotnet build
\`\`\`

## Execução

\`\`\`bash
dotnet run --project src/Projeto
\`\`\`

## Testes

\`\`\`bash
dotnet test
\`\`\`
`,
  android: `# Nome do Projeto (Android/Kotlin)

[![android](https://img.shields.io/badge/Android-Gradle-3DDC84?logo=android&logoColor=white)](#)

## Build

Abra no Android Studio e rode.

## APK
Saída em \`app/build/outputs/apk\`.
`,
  go: `# Nome do Projeto (Go)

[![go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go&logoColor=white)](#)

## Instalação

\`\`\`bash
go mod tidy
\`\`\`

## Uso

\`\`\`bash
go run ./cmd/app
\`\`\`
`,
  rust: `# Nome do Projeto (Rust)

[![rust](https://img.shields.io/badge/Rust-stable-000?logo=rust&logoColor=white)](#)

## Build

\`\`\`bash
cargo build --release
\`\`\`

## Uso

\`\`\`bash
./target/release/app
\`\`\`
`,
  web: `# Nome do Projeto (Web)

[![web](https://img.shields.io/badge/Web-HTML/CSS/JS-ffb703)](#)

## Rodar local
Abra \`index.html\` no navegador.

## Estrutura
- \`index.html\`
- \`styles.css\`
- \`script.js\`
`,
  unity: `# Nome do Projeto (Unity)

[![unity](https://img.shields.io/badge/Unity-2022+-000?logo=unity&logoColor=white)](#)

## Abrir
Abra a pasta do projeto com o Unity Hub.

## Build
File → Build Settings → Platform (PC/Quest) → Build.
`
};