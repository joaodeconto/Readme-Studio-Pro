import { create } from 'zustand';

type RepoState = {
  owner?: string;
  repo?: string;
  branch?: string;
  prUrl?: string;
  set: (p: Partial<RepoState>) => void;
};

export const useRepoStore = create<RepoState>((set) => ({
  owner: undefined,
  repo: undefined,
  branch: 'main',
  prUrl: undefined,
  set: (p) => set(p),
}));