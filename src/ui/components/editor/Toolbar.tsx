"use client";
import Button from '../ui/button';
import type { MutableRefObject } from 'react';
import type { EditorView } from '@codemirror/view';
import { buildTOC } from '../../../features/toc';
import { useEditorStore } from '../../state/editor';

function wrapSelection(view: EditorView, before: string, after: string = before) {
  const { from, to } = view.state.selection.main;
  const text = view.state.doc.sliceString(from, to);
  const insert = before + text + after;
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + before.length, head: from + before.length + text.length },
  });
}

function insertHeading(view: EditorView) {
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  view.dispatch({ changes: { from: line.from, insert: '# ' } });
}

function insertList(view: EditorView) {
  const sel = view.state.selection.main;
  const doc = view.state.doc;
  const start = doc.lineAt(sel.from).number;
  const end = doc.lineAt(sel.to).number;
  const changes: { from: number; insert: string }[] = [];
  for (let i = start; i <= end; i++) {
    const line = doc.line(i);
    const text = doc.sliceString(line.from, line.from + 2);
    if (text !== '- ') {
      changes.push({ from: line.from, insert: '- ' });
    }
  }
  view.dispatch({ changes });
}

function insertCode(view: EditorView) {
  wrapSelection(view, '\n```\n', '\n```\n');
}

export default function Toolbar({
  editorRef,
}: {
  editorRef: MutableRefObject<EditorView | undefined>;
}) {
  const { content, useEmoji } = useEditorStore();

  const withView = (fn: (v: EditorView) => void) => () => {
    const view = editorRef.current;
    if (view) fn(view);
  };

  const insertToc = withView((view) => {
    const toc = buildTOC(content, { useEmoji });
    if (!toc) return;
    const { from } = view.state.selection.main;
    view.dispatch({ changes: { from, to: from, insert: `\n## Sumário\n${toc}\n` } });
  });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="secondary"
        onClick={withView((v) => wrapSelection(v, '**'))}
        aria-label="bold"
      >
        <b>B</b>
      </Button>
      <Button
        variant="secondary"
        onClick={withView(insertHeading)}
        aria-label="heading"
      >
        H1
      </Button>
      <Button
        variant="secondary"
        onClick={withView(insertList)}
        aria-label="unordered list"
      >
        •
      </Button>
      <Button
        variant="secondary"
        onClick={withView(insertCode)}
        aria-label="code block"
      >
        &lt;/&gt;
      </Button>
      <Button
        variant="secondary"
        onClick={insertToc}
        aria-label="table of contents"
      >
        ☰
      </Button>
    </div>
  );
}
