"use client";
import { useRepoStore } from '../../state/repo';

export default function BranchSelect() {
  const { branch, set } = useRepoStore();
  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={branch}
      onChange={(e) => set({ branch: e.target.value })}
    >
      <option>main</option>
      <option>develop</option>
    </select>
  );
}
