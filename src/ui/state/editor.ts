import { create } from 'zustand';

type EditorState = {
  content: string;
  useEmoji: boolean;
  bakeEmoji: boolean;
  dirty: boolean;
  setContent: (v: string) => void;
  setUseEmoji: (v: boolean) => void;
  setBakeEmoji: (v: boolean) => void;
  setDirty: (v: boolean) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  content: '# Título do Projeto\n\nBreve descrição…',
  useEmoji: true,
  bakeEmoji: false,
  dirty: false,
  setContent: (v) => set({ content: v, dirty: true }),
  setUseEmoji: (v) => set({ useEmoji: v }),
  setBakeEmoji: (v) => set({ bakeEmoji: v }),
  setDirty: (v) => set({ dirty: v }),
}));