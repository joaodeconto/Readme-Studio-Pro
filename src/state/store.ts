// src/state/store.ts

export interface InputsState {
  installation_id: string;
  owner: string;
  repo: string;
  ref: string;
  readme_path: string;
  message: string;
  base_sha: string; // SHA do README carregado
}

export interface AppState {
  inputs: InputsState;
  analysis: unknown; // resposta de /analisar (findings, preview, base_sha)
  pr: unknown; // resposta de /propor-pr
  original_readme: string; // conteúdo original carregado
}

export const state: AppState = {
  inputs: {
    installation_id: '',
    owner: '',
    repo: '',
    ref: 'main',
    readme_path: 'README.md',
    message: 'docs: atualiza README (TOC)',
    base_sha: '',
  },
  analysis: null,
  pr: null,
  original_readme: '',
};

export function setInput<K extends keyof InputsState>(key: K, value: InputsState[K]): void {
  state.inputs[key] = value;
}

export function setAnalysis(data: unknown): void {
  state.analysis = data;
}

export function setPR(data: unknown): void {
  state.pr = data;
}

// Persistência simples de texto no localStorage com um valor padrão
export interface TextStore {
  get text(): string;
  set text(v: string);
}

export const store: TextStore = {
  get text() {
    return localStorage.getItem('readmeStudioProGH') || defaultText;
  },
  set text(v: string) {
    localStorage.setItem('readmeStudioProGH', v);
  },
};

export const defaultText = `# Nome do Projeto

Breve descrição…

> [!TIP]
> Use o painel à esquerda para inserir blocos prontos.
`;
