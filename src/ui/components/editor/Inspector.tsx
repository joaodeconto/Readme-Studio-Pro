"use client";
import { useUIStore } from '@ui/state/ui';
import TocPanel from './panels/TocPanel';
import EmojiPanel from './panels/EmojiPanel';
import SnippetLibrary from './panels/SnippetLibrary';
import AssetPicker from './panels/AssetPicker';
import LintPanel from './panels/LintPanel';
import AIPanel from './panels/AIPanel';

const tabs = [
  { id: 'toc', label: 'TOC' },
  { id: 'emoji', label: 'Emojis' },
  { id: 'snippets', label: 'Snippets' },
  { id: 'assets', label: 'Imagens' },
  { id: 'lint', label: 'Lint' },
  { id: 'ai', label: 'AI' },
];

export default function Inspector() {
  const { inspectorTab, set } = useUIStore();
  return (
    <aside className="w-80 border-l h-full flex flex-col">
      <div className="h-10 border-b flex gap-1 px-2 items-center">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`text-xs px-2 py-1 rounded ${
              inspectorTab === t.id ? 'bg-subtle font-medium' : ''
            }`}
            onClick={() => set({ inspectorTab: t.id })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-2">
        {inspectorTab === 'toc' && <TocPanel />}
        {inspectorTab === 'emoji' && <EmojiPanel />}
        {inspectorTab === 'snippets' && <SnippetLibrary />}
        {inspectorTab === 'assets' && <AssetPicker />}
        {inspectorTab === 'lint' && <LintPanel />}
        {inspectorTab === 'ai' && <AIPanel />}
      </div>
    </aside>
  );
}
