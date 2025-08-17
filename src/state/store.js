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