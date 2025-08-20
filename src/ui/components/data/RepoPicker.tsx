"use client";
import { useRepoStore } from '../../state/repo';
import Button from '../ui/button';

export default function RepoPicker() {
  const { owner, repo, set } = useRepoStore();
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => {
          // TODO: open modal to select repository
        }}
      >
        Selecionar Repo
      </Button>
      <span className="text-sm text-muted">
        {owner && repo ? `${owner}/${repo}` : '—'}
      </span>
    </div>
  );
}