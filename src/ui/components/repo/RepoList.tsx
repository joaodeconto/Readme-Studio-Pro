"use client";

import { useEffect, useState } from "react";
import { discoverRepos } from "@/github/fetch.js";

// Repository item as returned by the backend
interface Repo {
  owner: string;
  repo: string;
  full_name: string;
}

export interface RepoListProps {
  installationId: number;
  onSelect?: (repo: Repo) => void;
}

export default function RepoList({ installationId, onSelect }: RepoListProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch repositories whenever installationId changes
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await discoverRepos(installationId);
        if (!ignore) setRepos(data.items || []);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Erro ao carregar repositórios");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (installationId) load();
    return () => {
      ignore = true;
    };
  }, [installationId]);

  const filtered = query
    ? repos.filter((r) => r.full_name.toLowerCase().includes(query.toLowerCase()))
    : repos;

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Buscar..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded px-2 py-1"
      />
      {loading && <div>Carregando...</div>}
      {error && <div className="text-danger text-sm">{error}</div>}
      {!loading && !error && (
        <ul className="divide-y rounded border max-h-64 overflow-y-auto">
          {filtered.map((r) => (
            <li key={r.full_name}>
              <button
                className="w-full text-left px-2 py-1 hover:bg-subtle"
                onClick={() => onSelect?.(r)}
              >
                {r.full_name}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-2 text-sm text-muted">Nenhum repositório encontrado</li>
          )}
        </ul>
      )}
    </div>
  );
}
