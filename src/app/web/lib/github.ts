import { useMutation } from '@tanstack/react-query';

export async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
  const res = await fetch(`/api/github/file?owner=${owner}&repo=${repo}&path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao obter ficheiro');
  }
  const data = await res.json();
  return atob(data.content);
}

export function useUpdateFile() {
  return useMutation({
    mutationFn: async ({
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
      const res = await fetch('/api/github/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, path, content: btoa(content), message, sha }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao atualizar ficheiro');
      }
      return res.json();
    },
    onMutate: async () => {
      // Lógica para mostrar estado "saving…"
    },
    onError: (err, variables, context) => {
      // Lógica para rollback (se necessário)
    },
    onSuccess: (data) => {
      // Atualize sha e estado de sincronização aqui
    },
  });
}

export function useCreateBranch() {
  return useMutation({
    mutationFn: async ({
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
    },
  });
}

export function useCreatePR() {
  return useMutation({
    mutationFn: async ({
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
    },
  });
}
