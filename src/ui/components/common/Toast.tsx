"use client";
import { useEffect } from 'react';
import { useToastStore, dismissToast } from '@ui/state/toast';
import type { Toast } from '@ui/state/toast';

// 1) declare um mapa “fechado” e com uma chave default
const variantStyles = {
  info: 'bg-accent text-white',
  success: 'bg-success text-white',
  warn: 'bg-accent text-white',
  error: 'bg-danger text-white',
  default: 'bg-accent text-white',
} as const;

type VariantKey = keyof typeof variantStyles; // "info" | "success" | "warn" | "error" | "default"

function ToastItem({ t }: { t: Toast }) {
  useEffect(() => {
    const id = setTimeout(() => dismissToast(t.id), t.duration ?? 3000);
    return () => clearTimeout(id);
  }, [t.id, t.duration]);

  // 2) normalize a variant antes de indexar (evita undefined)
  const key = (t.variant ?? 'default') as VariantKey;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-2 rounded px-4 py-2 shadow-2 ${variantStyles[key]}`}
    >
      <span className="flex-1">{t.message}</span>
      <button
        onClick={() => dismissToast(t.id)}
        aria-label="Dismiss"
        className="text-white/80 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-80 flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}

export { enqueueToast, dismissToast } from '@ui/state/toast';
