import { create } from 'zustand';

export type ToastVariant = 'info' | 'success' | 'warn' | 'error';

export interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number; // ms
}

interface ToastStore {
  toasts: Toast[];
  enqueue: (t: Omit<Toast, 'id'> & { id?: string }) => string;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  enqueue: (t) => {
    const id = t.id ?? Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((tt) => tt.id !== id) })),
}));

export function enqueueToast(t: Omit<Toast, 'id'>) {
  return useToastStore.getState().enqueue(t);
}

export function dismissToast(id: string) {
  useToastStore.getState().dismiss(id);
}
