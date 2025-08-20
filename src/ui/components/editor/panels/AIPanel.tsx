"use client";
import { useAnalysisStore } from '../../../state/analysis';

export default function AIPanel() {
  const { aiSuggestions } = useAnalysisStore();
  if (!aiSuggestions.length)
    return <div className="text-sm text-muted">Sem sugestões no momento.</div>;

  return (
    <ul className="text-sm space-y-2">
      {aiSuggestions.map((s, i) => (
        <li key={i} className="border border-dashed rounded p-2 bg-subtle">
          {s}
        </li>
      ))}
    </ul>
  );
}
