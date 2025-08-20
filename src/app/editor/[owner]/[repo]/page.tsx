// @ts-nocheck
// Next.js 15: `params` e `searchParams` são Promises.
// Use `use()` para aguardar `props.params` antes de acessar owner/repo.

import { use } from 'react';

export default function EditorPage(props: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = use(props.params);

  return (
    <main className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Editor: {owner}/{repo}</h1>
      <p>Conecte seu GitHub App e carregue o README abaixo.</p>
    </main>
  );
}
