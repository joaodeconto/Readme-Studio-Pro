import { useMutation } from '@tanstack/react-query';

export async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
  // TODO: substituir por chamada real à API (GitHub REST ou conector interno)
  const res = await fetch(`/api/github/file?owner=${owner}&repo=${repo}&path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('Falha ao obter ficheiro');
  const data = await res.json();
  return atob(data.content);
}

export function useUpdateFile() {
  return useMutation(
    async ({
      owner,
      repo,
      path,
      content,
      message,
      sha,
    }: {
      owner: string;
      repo: string;
      path: string;
      content: string;
      message: string;
      sha: string;
    }) => {
      // TODO: chamar rota interna ou conector que faz PUT no GitHub
      const res = await fetch('/api/github/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, path, content: btoa(content), message, sha }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar ficheiro');
      return res.json();
    },
    {
      onMutate: async () => {
        // Lógica para mostrar estado "saving…"
      },
      onError: (err, variables, context) => {
        // Lógica para rollback (se necessário)
      },
      onSuccess: (data) => {
        // Atualize sha e estado de sincronização aqui
      },
    }
  );
}

export function useCreateBranch() {
  return useMutation(
    async ({
      owner,
      repo,
      newBranch,
      fromSha,
    }: {
      owner: string;
      repo: string;
      newBranch: string;
      fromSha: string;
    }) => {
      const res = await fetch('/api/github/branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, newBranch, fromSha }),
      });
      if (!res.ok) throw new Error('Falha ao criar branch');
      return res.json();
    }
  );
}

export function useCreatePR() {
  return useMutation(
    async ({
      owner,
      repo,
      title,
      body,
      head,
      base,
    }: {
      owner: string;
      repo: string;
      title: string;
      body: string;
      head: string;
      base: string;
    }) => {
      const res = await fetch('/api/github/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, title, body, head, base }),
      });
      if (!res.ok) throw new Error('Falha ao criar PR');
      return res.json();
    }
  );
}