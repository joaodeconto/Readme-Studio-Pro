"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RepoList from "@ui/components/repo/RepoList";

export default function RepositoriesPage() {
  const [installationId, setInstallationId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/github/install");
        if (!res.ok) return;
        const data = await res.json();
        setInstallationId(data.installationId ?? null);
      } catch {
        setInstallationId(null);
      }
    };
    load();
  }, []);

  if (installationId === null) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <RepoList
      installationId={installationId}
      onSelect={(r) => router.push(`/pages/editor/${r.owner}/${r.repo}`)}
    />
  );
}
