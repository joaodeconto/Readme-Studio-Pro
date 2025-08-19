// src/state/store.js
export const state = {
  inputs: {
    installation_id: '',
    owner: '',
    repo: '',
    ref: 'main',
    readme_path: 'README.md',
    message: 'docs: atualiza README (TOC)'
  },
  analysis: null,        // resposta de /analisar (findings, preview, base_sha)
  pr: null,              // resposta de /propor-pr
  original_readme: '',   // conteúdo original carregado
};

export function setInput(key, value) {
  state.inputs[key] = value;
}

export function setAnalysis(data) {
  state.analysis = data;
}

export function setPR(data) {
  state.pr = data;
}


// Persistência simples de texto no localStorage com um valor padrão
export const store = {
  get text() { return localStorage.getItem('readmeStudioProGH') || defaultText; },
  set text(v) { localStorage.setItem('readmeStudioProGH', v); },
};

export const defaultText = `# Nome do Projeto

Breve descrição…

> [!TIP]
> Use o painel à esquerda para inserir blocos prontos.
`;