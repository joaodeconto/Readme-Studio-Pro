import Topbar from '../../../../../../src/ui/components/shell/Topbar.jsx';
import StatusBar from '../../../../../ui/components/shell/StatusBar';
import MdEditor from '../../../../../ui/components/editor/MdEditor';
import MdPreview from '../../../../../ui/components/editor/MdPreview';
import Inspector from '../../../../../ui/components/editor/Inspector';
import { useEditorStore } from '../../../../../ui/state/editor';
import { useRepoStore } from '../../../../../ui/state/repo';
import { useEffect, useState } from 'react';

export default function EditorPage() {
  const { content, setContent, dirty, setDirty } = useEditorStore();
  const { branch } = useRepoStore();
  const [rightPreview, setRightPreview] = useState(false);
  const [autosaveAt, setAutosaveAt] = useState<string>();

  // Autosave local (offline-tolerant)
  useEffect(() => {
    const t = setInterval(() => {
      localStorage.setItem('readme-draft', content);
      setAutosaveAt(new Date().toLocaleTimeString());
    }, 3000);
    return () => clearInterval(t);
  }, [content]);

  // Unsaved guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const onSave = () => {
    // TODO: optimistic save -> Git (mutation). Aqui só marca como salvo.
    setDirty(false);
  };
  const onPublish = () => {
    // TODO: criar PR (mutation) e exibir link na UI
    alert('TODO: Criar PR (GitHub API)');
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
          <div className="grid grid-cols-2 gap-3 overflow-hidden">
            <MdEditor value={content} onChange={setContent} />
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
      <StatusBar autosaveAt={autosaveAt} branch={branch} lintCount={0} />
    </div>
  );
}