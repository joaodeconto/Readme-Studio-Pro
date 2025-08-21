"use client";

import { useState } from "react";
import { useEditorStore } from "../../../state/editor";
import { snippets, snippetCategories } from "../snippets";

export default function SnippetLibrary() {
  const { content, setContent } = useEditorStore();
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = snippets.filter((s) => {
    const matchCat = category === "all" || s.category === category;
    const matchQuery = s.label.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const insert = (text: string) => {
    const sep = content.endsWith("\n") ? "" : "\n";
    setContent(content + sep + text);
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex gap-2 items-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-1 text-xs"
        >
          <option value="all">Todas</option>
          {snippetCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar"
          className="border rounded px-1 flex-1 text-xs"
        />
      </div>
      <ul className="space-y-2">
        {filtered.map((s) => (
          <li key={s.id}>
            <button
              className="w-full text-left border rounded p-2 hover:bg-subtle"
              onClick={() => insert(s.content)}
            >
              <div className="font-medium">{s.label}</div>
              <pre className="text-xs whitespace-pre-wrap mt-1 text-muted">
                {s.content}
              </pre>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-muted">Nenhum snippet encontrado</li>
        )}
      </ul>
    </div>
  );
}
