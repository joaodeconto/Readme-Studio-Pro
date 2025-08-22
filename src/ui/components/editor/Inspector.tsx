"use client";
import { useUIStore } from '@ui/state/ui';
import TocPanel from './panels/TocPanel';
import EmojiPanel from './panels/EmojiPanel';
import SnippetLibrary from './panels/SnippetLibrary';
import LintPanel from './panels/LintPanel';
import AIPanel from './panels/AIPanel';
import { useState, useEffect } from "react";
import AssetPicker, { type Asset } from "./panels//AssetPicker";

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

  const [assets, setAssets] = useState<Asset[]>([]);

  // opcional: exemplo de upload local (gera blob URL só p/ protótipo)
  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setAssets(prev => [{ id: crypto.randomUUID(), name: file.name, url }, ...prev]);
  };

  // exemplo de seleção de asset (aqui só log; integre com seu editor se quiser)
  const handleSelect = (asset: Asset) => {
    console.log("Selecionado:", asset);
    // Ex.: inserir markdown na área de edição
    // setContent(prev => `${prev}\n\n![${asset.name}](${asset.url})`);
  };

  // opcional: limpar blob URLs ao desmontar / trocar lista
  useEffect(() => {
    return () => {
      for (const a of assets) {
        if (a.url.startsWith("blob:")) URL.revokeObjectURL(a.url);
      }
    };
  }, [assets]);

  return (
    <aside className="w-80 border-l h-full flex flex-col">
      <div className="h-10 border-b flex gap-1 px-2 items-center">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`text-xs px-2 py-1 rounded ${inspectorTab === t.id ? 'bg-subtle font-medium' : ''
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
        {inspectorTab === "assets" && (
          <AssetPicker
            assets={assets}
            onSelect={handleSelect}
            onUpload={handleUpload} // remova se não quiser upload
          />
        )}
        {inspectorTab === 'lint' && <LintPanel />}
        {inspectorTab === 'ai' && <AIPanel />}
      </div>
    </aside>
  );
}
