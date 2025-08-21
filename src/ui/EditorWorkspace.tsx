import { useState, useMemo, useCallback, useContext, createContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeSlug from 'rehype-slug';

// Simple toast context to replace direct DOM manipulation
interface ToastCtx {
  show: (msg: string, type?: 'info' | 'ok' | 'err') => void;
}
const ToastContext = createContext<ToastCtx>({ show: () => {} });
export function useToast() {
  return useContext(ToastContext);
}
function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const show = useCallback((msg: string, type: 'info' | 'ok' | 'err' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </ToastContext.Provider>
  );
}

// Hooks
function useMarkdownStats(text: string) {
  return useMemo(() => {
    const noCode = text.replace(/```[\s\S]*?```/g, '');
    const words = (noCode.match(/[A-Za-zÀ-ÿ0-9_]+/g) || []).length;
    const headings = (noCode.match(/^#{1,6}\s/mg) || []).length;
    return { words, headings };
  }, [text]);
}

// Components
function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <textarea className="w-full h-full border p-2" value={value} onChange={(e) => onChange(e.target.value)} />;
}

function Preview({ text }: { text: string }) {
  return (
    <div className="preview border p-2 overflow-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSlug]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function Toolbar({ onBold, onHeading, onToc }: { onBold: () => void; onHeading: () => void; onToc: () => void }) {
  return (
    <div className="flex gap-2 mb-2">
      <button type="button" onClick={onBold} className="btn">B</button>
      <button type="button" onClick={onHeading} className="btn">H1</button>
      <button type="button" onClick={onToc} className="btn">TOC</button>
    </div>
  );
}

export default function EditorWorkspace() {
  const [text, setText] = useState<string>('# Projeto Demo\n');
  const stats = useMarkdownStats(text);
  const toast = useToast();

  const insert = (snippet: string) => setText(t => t + snippet);

  const onBold = () => insert('**bold**');
  const onHeading = () => insert('\n## Título\n');
  const onToc = () => insert('\n## Sumário\n- Item\n');

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="flex flex-col h-full">
        <Toolbar onBold={onBold} onHeading={onHeading} onToc={onToc} />
        <MarkdownEditor value={text} onChange={setText} />
        <div className="text-sm text-muted mt-2">{stats.words} palavras • {stats.headings} seções</div>
      </div>
      <Preview text={text} />
      <button type="button" className="hidden" onClick={() => toast.show('ok', 'ok')} />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <EditorWorkspace />
    </ToastProvider>
  );
}

