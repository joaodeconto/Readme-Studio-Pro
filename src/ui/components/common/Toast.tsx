"use client";
import { useEffect } from 'react';
import {
  useToastStore,
  dismissToast,
  Toast,
  ToastVariant,
} from '@ui/state/toast';

const variantStyles: Record<ToastVariant | undefined, string> = {
  info: 'bg-accent text-white',
  success: 'bg-success text-white',
  warn: 'bg-accent text-white',
  error: 'bg-danger text-white',
  undefined: 'bg-accent text-white',
};

function ToastItem({ t }: { t: Toast }) {
  useEffect(() => {
    const id = setTimeout(() => dismissToast(t.id), t.duration ?? 3000);
    return () => clearTimeout(id);
  }, [t.id, t.duration]);
  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-2 rounded px-4 py-2 shadow-2 ${variantStyles[t.variant]}`}
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
