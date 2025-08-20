"use client";
import SyncBadge from '../data/SyncBadge';

export default function StatusBar({
  autosaveAt,
  branch,
  lintCount,
}: {
  autosaveAt?: string;
  branch?: string;
  lintCount?: number;
}) {
  return (
    <div className="h-8 border-t text-xs px-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SyncBadge />
        <span>
          Branch: <b>{branch ?? '-'}</b>
        </span>
        <span>
          Lint: <b>{lintCount ?? 0}</b>
        </span>
      </div>
      <div className="text-muted">Autosave: {autosaveAt ?? '—'}</div>
    </div>
  );
}