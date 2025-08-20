"use client";
import { useState } from 'react';

export default function SyncBadge() {
  const [state] = useState<'idle' | 'saving' | 'error'>('idle');
  const label =
    state === 'saving' ? 'Salvando…' : state === 'error' ? 'Erro' : 'Sincronizado';
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-subtle">
      {label}
    </span>
  );
}