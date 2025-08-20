"use client";
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { MutableRefObject } from 'react';

export default function MdEditor({
  value,
  onChange,
  viewRef,
}: {
  value: string;
  onChange: (v: string) => void;
  viewRef?: MutableRefObject<EditorView | undefined>;
}) {
  const extensions = useMemo(() => [markdown(), EditorView.lineWrapping], []);
  return (
    <div className="h-[calc(100dvh-12rem)] border rounded overflow-hidden">
      <CodeMirror
        value={value}
        height="100%"
        extensions={extensions}
        onChange={(v, viewUpdate) => {
          onChange(v);
          if (viewRef) viewRef.current = viewUpdate.view;
        }}
      />
    </div>
  );
}