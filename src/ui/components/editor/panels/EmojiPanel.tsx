"use client";
import { useEditorStore } from '../../../state/editor';
const emojis = ['✨', '🚀', '🧩', '📦', '🛠️', '✅', '⚠️', '📊', '🧪'];

export default function EmojiPanel() {
  const { content, setContent } = useEditorStore();
  const insert = (e: string) => setContent(content + ' ' + e);
  return (
    <div className="flex flex-wrap gap-2">
      {emojis.map((e) => (
        <button
          key={e}
          className="border rounded px-2"
          onClick={() => insert(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
