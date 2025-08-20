// @ts-nocheck
"use client";
import Topbar from '@ui/components/shell/Topbar';
import StatusBar from '@ui/components/shell/StatusBar';
import MdEditor from '@ui/components/editor/MdEditor';
import MdPreview from '@ui/components/editor/MdPreview';
import Inspector from '@ui/components/editor/Inspector';
import Toolbar from '@ui/components/editor/Toolbar';
import AnalysisBar from '@ui/components/editor/AnalysisBar';
import { useEditorStore } from '@ui/state/editor';
import { useRepoStore } from '@ui/state/repo';
import { useEffect, useState, useRef, use } from 'react';
import { EditorView } from '@codemirror/view';
import { useUpdateFile, useCreatePR } from '@/app/web/lib/github';

export default function EditorPage(props: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = use(props.params);
  const { content, setContent, dirty, setDirty } = useEditorStore();
  const { branch, prUrl, set: setRepo } = useRepoStore();
  const [rightPreview, setRightPreview] = useState(false);
  const [autosaveAt, setAutosaveAt] = useState<string>();
  const [lintCount, setLintCount] = useState(0);
  const editorRef = useRef<EditorView>(new EditorView);
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState<string>();
  const fileSha = useRef<string>('');
  const updateFile = useUpdateFile();
  const createPR = useCreatePR();

  useEffect(() => {
    setRepo({ owner, repo });
  }, [owner, repo, setRepo]);

  // Carrega README e SHA inicial
  useEffect(() => {
    const load = async () => {
      if (!owner || !repo) return;
      try {
        const res = await fetch(
          `/api/github/file?owner=${owner}&repo=${repo}&path=${encodeURIComponent(
            'README.md'
          )}`
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg =
            res.status === 404
              ? 'README não encontrado.'
              : err.error || 'Falha ao carregar README.';
          setError(msg);
          setSyncState('error');
          return;
        }
        const data = await res.json();
        setContent(atob(data.content));
        fileSha.current = data.sha;
        setDirty(false);
        setError(undefined);
        updateFile.mutate(
          {
            owner,
            repo,
            path: 'README.md',
            content,
            message: 'docs: atualiza README',
            sha: fileSha.current,
          },
          {
            onSuccess: (data) => {
              fileSha.current = (data as any)?.sha || fileSha.current;
              setDirty(false);
              setSyncState('idle');
            },
            onError: (err: any) => {
              setSyncState('error');
              setError(err.message);
            },
          }
        )
      }
      catch {

      }
    }
  });
  const onPublish = () => {
    if (!owner || !repo) {
      setError('Selecione um repositório.');
      return;
    }
    setError(undefined);
    createPR.mutate(
      {
        owner,
        repo,
        title: 'docs: atualiza README',
        body: 'Atualiza README via Readme Studio',
        head: branch!,
        base: 'main',
      },
      {
        onSuccess: (data) => {
          const url = (data as any)?.url || (data as any)?.html_url;
          if (url) setRepo({ prUrl: url });
        },
        onError: (err: any) => {
          setError(err.message);
        },
      }
    )
  };
};

return (
  <div className="flex flex-col h-full">
    <Topbar onSave={onSave} onPublish={onPublish} onOpenAI={() => alert('AI Assist')} />
    <div className="flex-1 grid grid-cols-[1fr_1fr_auto] gap-3 p-3 overflow-hidden">
      <div className="flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">Editor</div>
          <label className="text-xs flex items-center gap-1">
            <input type="checkbox" checked={rightPreview} onChange={(e) => setRightPreview(e.target.checked)} />
            Preview à direita
          </label>
        </div>
        <Toolbar editorRef={editorRef} />
        <div className="grid grid-cols-2 gap-3 overflow-hidden">
          <MdEditor value={content} onChange={setContent} viewRef={editorRef} />
          {rightPreview ? (
            <MdPreview value={content} />
          ) : (
            <div className="border rounded p-3 text-muted">Desativado</div>
          )}
        </div>
      </div>
      {/* Inspector fixo à direita */}
      <Inspector />
    </div>
    <AnalysisBar setLintCount={setLintCount} />
    <StatusBar
      autosaveAt={autosaveAt}
      branch={branch}
      lintCount={lintCount}
      prUrl={prUrl}
      syncState={syncState}
      error={error}
    />
  </div>
);

