"use client";
import SyncBadge from '../data/SyncBadge';

export default function StatusBar({
  autosaveAt,
  branch,
  lintCount,
  prUrl,
  syncState,
  error,
}: {
  autosaveAt?: string;
  branch?: string;
  lintCount?: number;
  prUrl?: string;
  syncState: 'idle' | 'saving' | 'error';
  error?: string;
}) {
  return (
    <div className="h-8 border-t text-xs px-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SyncBadge state={syncState} />
        <span>
          Branch: <b>{branch ?? '-'}</b>
        </span>
        <span>
          Lint: <b>{lintCount ?? 0}</b>
        </span>
        {prUrl && (
          <span>
            PR: <a href={prUrl} target="_blank" className="underline">abrir</a>
          </span>
        )}
      </div>
      <div className="text-muted">
        {error ? <span className="text-red-600">{error}</span> : `Autosave: ${autosaveAt ?? '—'}`}
      </div>
    </div>
  );
}
