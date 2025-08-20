"use client";
import { useEditorStore } from '../../../state/editor';

export default function TocPanel() {
  const { content } = useEditorStore();
  const lines = content.split('\n').filter((l) => /^#{1,6}\s/.test(l));
  return (
    <div className="text-sm space-y-1">
      {lines.map((l, i) => {
        const level = (l.match(/^#+/)?.[0].length) || 1;
        const title = l.replace(/^#{1,6}\s*/, '');
        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
        return (
          <a
            key={i}
            href={`#${id}`}
            className="block hover:underline"
            style={{ paddingLeft: (level - 1) * 8 }}
          >
            {title}
          </a>
        );
      })}
    </div>
  );
}