"use client";
import { useEffect, useState } from 'react';
import { useRepoStore } from '@ui/state/repo';
import Button from '@ui/components/ui/button';
import Modal from '@ui/components/ui/modal';
import { discoverInstallations, discoverRepos } from '@/github/fetch';

type RepoItem = {
  owner: string;
  repo: string;
  full_name: string;
};

export default function RepoPicker({
  onSelect,
}: {
  onSelect?: (owner: string, repo: string) => void;
}) {
  const { owner, repo, set } = useRepoStore();
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<RepoItem[]>([]);

  useEffect(() => {
    if (!open) return;
    async function load() {
      try {
        const inst = await discoverInstallations();
        const installationId = inst.items?.[0]?.installation_id;
        if (!installationId) throw new Error('no installation');
        const data = await discoverRepos(installationId);
        setRepos(data.items ?? []);
      } catch {
        setRepos([]);
      }
    }
    load();
  }, [open]);

  const choose = (o: string, r: string) => {
    set({ owner: o, repo: r });
    onSelect?.(o, r);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Selecionar Repo
      </Button>
      <span className="text-sm text-muted">
        {owner && repo ? `${owner}/${repo}` : '—'}
      </span>
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="mb-2 font-semibold">Repositórios</h3>
        <ul className="space-y-1">
          {repos.map((r) => (
            <li key={r.full_name}>
              <button
                className="text-left w-full hover:bg-subtle px-2 py-1 rounded"
                onClick={() => choose(r.owner, r.repo)}
              >
                {r.full_name}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-right">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </div>
      </Modal>
    </div>
  );
}