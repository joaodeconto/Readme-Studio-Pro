"use client";
import Link from 'next/link';
import { BookOpen, Boxes, Settings, GitBranch, Layout, Bot } from 'lucide-react';

const items = [
  { href: '/web', icon: Layout, label: 'Dashboard' },
  { href: '/web/repositories', icon: GitBranch, label: 'Repositories' },
  { href: '/web/editor/owner/repo', icon: BookOpen, label: 'README Studio' },
  { href: '/web/templates', icon: Boxes, label: 'Templates' },
  { href: '/web/automations', icon: Bot, label: 'Automations' },
  { href: '/web/settings', icon: Settings, label: 'Settings' },
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
