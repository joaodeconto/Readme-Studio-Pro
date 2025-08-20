"use client";
import Link from 'next/link';
import { BookOpen, Boxes, Settings, GitBranch, Layout, Bot } from 'lucide-react';

const items = [
  { href: '/(dashboard)', icon: Layout, label: 'Dashboard' },
  { href: '/repositories', icon: GitBranch, label: 'Repositories' },
  { href: '/editor/owner/repo', icon: BookOpen, label: 'README Studio' },
  { href: '/templates', icon: Boxes, label: 'Templates' },
  { href: '/automations', icon: Bot, label: 'Automations' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppSidebar() {
  return (
    <aside className="w-60 border-r bg-subtle/50 dark:bg-neutral-900 p-3 space-y-2">
      <div className="px-2 py-1 font-semibold">📘 README Studio</div>
      <nav className="flex flex-col">
        {items.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-subtle">
            <Icon size={16} /> <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}