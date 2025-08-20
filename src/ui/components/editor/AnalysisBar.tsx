"use client";
import Button from '../ui/button';
import { useEditorStore } from '../../state/editor';
import { useState } from 'react';
import { lintMarkdown } from '../../../utils/lint.js';
import DiffMatchPatch from 'diff-match-patch';

export default function AnalysisBar({
  setLintCount,
}: {
  setLintCount: (n: number) => void;
}) {
  const { content } = useEditorStore();
  const [analysis, setAnalysis] = useState<any>();
  const [original, setOriginal] = useState('');
  const [diffHtml, setDiffHtml] = useState<string>();

  const analyze = () => {
    const res = lintMarkdown(content);
    setAnalysis(res);
    setLintCount(res.issues.length);
    setOriginal(content);
  };

  const preview = () => {
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(original, content);
    dmp.diff_cleanupSemantic(diff);
    setDiffHtml(dmp.diff_prettyHtml(diff));
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
