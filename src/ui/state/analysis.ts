import { create } from 'zustand';

type Issue = { sev: string; msg: string; line?: number };

type AnalysisState = {
  lintIssues: Issue[];
  aiSuggestions: string[];
  setLintIssues: (issues: Issue[]) => void;
  setAISuggestions: (sugs: string[]) => void;
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  lintIssues: [],
  aiSuggestions: [],
  setLintIssues: (issues) => set({ lintIssues: issues }),
  setAISuggestions: (aiSuggestions) => set({ aiSuggestions }),
}));
