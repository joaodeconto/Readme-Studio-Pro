import { create } from 'zustand';

type UIState = {
  showInspector: boolean;
  inspectorTab: string;
  showAIAssist: boolean;
  set: (p: Partial<UIState>) => void;
};

export const useUIStore = create<UIState>((set) => ({
  showInspector: true,
  inspectorTab: 'toc',
  showAIAssist: false,
  set: (p) => set(p),
}));