export default function Page({ params }: { params: { owner: string; repo: string } }) {
  return (
    <main className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Editor: {params.owner}/{params.repo}</h1>
      <p>Conecte seu GitHub App e carregue o README abaixo.</p>
    </main>
  );
}
