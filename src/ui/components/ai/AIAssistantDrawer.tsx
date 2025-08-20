"use client";
import { useState } from 'react';
import { useUIStore } from '@ui/state/ui';
import Button from '@ui/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantDrawerProps {
  suggestions?: string[];
  messages?: Message[];
}

export default function AIAssistantDrawer({
  suggestions = [],
  messages = [],
}: AIAssistantDrawerProps) {
  const { showAIAssist, set } = useUIStore();
  const [tab, setTab] = useState<'suggestions' | 'chat'>('suggestions');

  if (!showAIAssist) {
    return (
      <button
        className="fixed bottom-4 right-4 bg-accent text-white rounded-full p-3 shadow-lg"
        onClick={() => set({ showAIAssist: true })}
      >
        AI
      </button>
    );
  }

  return (
    <aside className="fixed inset-y-0 right-0 w-80 bg-white border-l shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex gap-2">
          <Button
            variant={tab === 'suggestions' ? 'default' : 'secondary'}
            onClick={() => setTab('suggestions')}
          >
            Sugestões
          </Button>
          <Button
            variant={tab === 'chat' ? 'default' : 'secondary'}
            onClick={() => setTab('chat')}
          >
            Chat
          </Button>
        </div>
        <button
          className="text-sm text-muted hover:text-base"
          onClick={() => set({ showAIAssist: false })}
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'suggestions' ? (
          suggestions.length ? (
            <ul className="space-y-2 text-sm">
              {suggestions.map((s, i) => (
                <li key={i} className="p-2 rounded bg-subtle">
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nenhuma sugestão.</p>
          )
        ) : messages.length ? (
          <div className="space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <span
                  className={`px-2 py-1 rounded ${
                    m.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-subtle text-base'
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Comece a conversar…</p>
        )}
      </div>
    </aside>
  );
}
