"use client";
import Button from '../ui/button';
import { useEditorStore } from '../../state/editor';
import { useState } from 'react';
import { lintMarkdown, type LintMarkdownResult } from '../../../utils/lint';
import { buildDiffHtml } from "@/lib/diff/buildDiffHtml";
import { useAnalysisStore } from '../../state/analysis';

export default function AnalysisBar({
  setLintCount,
}: {
  setLintCount: (n: number) => void;
}) {
  const { content } = useEditorStore();
  const [analysis, setAnalysis] = useState<LintMarkdownResult | null>(null);
  const [original, setOriginal] = useState('');
  const [diffHtml, setDiffHtml] = useState<string | null>(null);
  const { setLintIssues, setAISuggestions } = useAnalysisStore();

  const analyze = () => {
    const res = lintMarkdown(content);
    setLintIssues(res.issues);
    const suggestions = res.issues
      .filter((i) => i.sev !== 'ok')
      .map((i) => `Revisar: ${i.msg}`);
    setAISuggestions(suggestions);
    setAnalysis(res);
    setLintCount(res.issues.length);
    setOriginal(content);
  };

  const preview = () => {
    const a = (original ?? "").toString();
    const b = (content ?? "").toString();
    const diff = buildDiffHtml(a, b);
    setDiffHtml(diff);
  };

  return (
    <div className="border-t p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button onClick={analyze}>Analisar</Button>
        <Button onClick={preview} disabled={!analysis}>
          Pré-visualizar
        </Button>
      </div>
      {analysis && (
        <pre className="text-xs bg-subtle p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(analysis.issues, null, 2)}
        </pre>
      )}
      {diffHtml && (
        <div
          className="diff md p-2 overflow-auto border rounded"
          dangerouslySetInnerHTML={{ __html: diffHtml }}
        />
      )}
    </div>
  );
}
