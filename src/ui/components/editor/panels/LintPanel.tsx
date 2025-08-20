"use client";
import { useAnalysisStore } from '../../../state/analysis';

export default function LintPanel() {
  const { lintIssues } = useAnalysisStore();
  if (!lintIssues.length)
    return <div className="text-sm text-muted">Nenhuma análise disponível.</div>;

  return (
    <ul className="text-sm space-y-2">
      {lintIssues.map((issue, idx) => (
        <li
          key={idx}
          className={`border border-dashed rounded p-2 bg-subtle ${
            issue.sev === 'err'
              ? 'border-red-500'
              : issue.sev === 'warn'
              ? 'border-amber-500'
              : 'opacity-80'
          }`}
        >
          {issue.msg}
          {issue.line && (
            <span className="text-muted ml-1">(linha {issue.line})</span>
          )}
        </li>
      ))}
    </ul>
  );
}
