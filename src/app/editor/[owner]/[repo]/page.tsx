// Next.js 15: `params` e `searchParams` são Promises.
// Use o helper global `PageProps` para tipar pelo literal de rota
// e **aguarde** `props.params` antes de acessar owner/repo.

// (opcional) import explícito do tipo — o helper é global, mas isso ajuda o TS intellisense
import type { PageProps } from 'next';

export default async function Page(props: PageProps<'/editor/[owner]/[repo]'>) {
  const { owner, repo } = await props.params; // ⬅️ await obrigatório no Next 15

  return (
    <main className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Editor: {owner}/{repo}</h1>
      <p>Conecte seu GitHub App e carregue o README abaixo.</p>
    </main>
  );
}
