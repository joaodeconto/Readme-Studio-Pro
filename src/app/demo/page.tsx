'use client';
import React, { useMemo, useState } from 'react';
import {
  Github,
  Save,
  Rocket,
  Wand2,
  Settings,
  ChevronDown,
  BookOpen,
  Image as ImageIcon,
  ListChecks,
  Plus,
  Sun,
  Moon,
  Share2,
  Search,
} from 'lucide-react';

/**
 * Readme Studio — Beautiful Tailwind Layout
 * ------------------------------------------------------------
 * - Clean, modern UI using TailwindCSS only (no extra UI libs)
 * - Responsive grid: Sidebar | Editor | Preview (collapses on mobile)
 * - Soft cards (rounded-2xl), subtle shadows, ample padding
 * - Minimal components (Button, Card, Toolbar) for reuse
 * - Dark/Light toggle (local state only, no persistence)
 * - Mock actions (no API wiring) — drop-in shell for your pages
 *
 * How to reuse:
 * - Replace <RepoPicker/> with your real data
 * - Replace <MarkdownEditor/> and <MarkdownPreview/> with real components
 * - This is a single-file demo kept intentionally framework-agnostic
 */

// ————————————————————————————————————————————————————————————
// Small UI primitives (kept here to stay self-contained)
// ————————————————————————————————————————————————————————————

const cn = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ');

function Button({
  children,
  className,
  variant = 'default',
  size = 'md',
  iconOnly,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default:
      'bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900',
    ghost: 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80',
    outline:
      'border border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60',
    primary:
      'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:brightness-110 shadow-sm',
  } as const;
  const sizes = {
    sm: iconOnly ? 'h-8 w-8' : 'h-8 px-3 text-sm',
    md: iconOnly ? 'h-10 w-10' : 'h-10 px-4',
    lg: iconOnly ? 'h-12 w-12' : 'h-12 px-5 text-lg',
  } as const;
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/70 shadow-sm backdrop-blur',
        className,
      )}
      {...props}
    />
  );
}

function SectionHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200/70 dark:border-zinc-800/70">
      <h3 className="text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">{title}</h3>
      {actions}
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Mock widgets for the demo layout
// ————————————————————————————————————————————————————————————

function RepoPicker() {
  const [owner, setOwner] = useState('joaodeconto');
  const [repo, setRepo] = useState('readme-studio-pro');
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Github className="h-4 w-4 text-zinc-500" />
        <span className="text-zinc-600 dark:text-zinc-300 text-sm">Repo</span>
      </div>
      <div className="flex items-center gap-1 bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1">
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="bg-transparent outline-none w-28 text-sm"
        />
        <span className="text-zinc-400">/</span>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="bg-transparent outline-none w-40 text-sm"
        />
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </div>
    </div>
  );
}

function Topbar({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <div className="sticky top-0 z-20 w-full">
      <div className="mx-auto max-w-[1400px] px-4 pt-4">
        <Card className="px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 text-white dark:text-zinc-900 grid place-items-center font-bold">R</div>
              <div>
                <div className="text-sm font-semibold leading-tight">README Studio</div>
                <div className="text-xs text-zinc-500 -mt-0.5">Edit • Preview • Ship</div>
              </div>
            </div>

            <div className="mx-3 h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

            {/* Repo picker */}
            <RepoPicker />

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 mr-2">
                <div className="relative">
                  <input
                    placeholder="Search blocks, repos…"
                    className="pl-9 pr-3 h-10 w-64 bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="default">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Assist
              </Button>
              <Button variant="primary">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="primary" className="hidden sm:inline-flex">
                <Rocket className="h-4 w-4 mr-2" />
                Publish
              </Button>
              <Button
                aria-label="Toggle theme"
                className="ml-1"
                variant="ghost"
                iconOnly
                onClick={() => setDark(!dark)}
                title={dark ? 'Switch to light' : 'Switch to dark'}
              >
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BlocksPalette() {
  const blocks = [
    { icon: <BookOpen className="h-4 w-4" />, label: 'Header + Badges' },
    { icon: <ListChecks className="h-4 w-4" />, label: 'Install' },
    { icon: <ListChecks className="h-4 w-4" />, label: 'Usage' },
    { icon: <ImageIcon className="h-4 w-4" />, label: 'Screenshots' },
    { icon: <ListChecks className="h-4 w-4" />, label: 'Roadmap' },
    { icon: <ListChecks className="h-4 w-4" />, label: 'Contributing' },
    { icon: <ListChecks className="h-4 w-4" />, label: 'License' },
  ];
  return (
    <Card>
      <SectionHeader
        title="Blocks Palette"
        actions=
          {<Button size="sm" variant="ghost">
            <Plus className="h-4 w-4 mr-1" />New
          </Button>}
      />
      <div className="p-2 grid grid-cols-1 gap-2">
        {blocks.map((b, i) => (
          <button
            key={i}
            className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70"
          >
            <div className="h-8 w-8 grid place-items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {b.icon}
            </div>
            <div className="text-sm">{b.label}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function Navigator() {
  const items = [
    { label: 'Overview' },
    { label: 'Installation' },
    { label: 'Usage' },
    { label: 'Examples' },
    { label: 'Screenshots' },
    { label: 'Roadmap' },
    { label: 'Contributing' },
    { label: 'License' },
  ];
  return (
    <Card>
      <SectionHeader title="Navigator" />
      <nav className="p-2 space-y-1">
        {items.map((it) => (
          <a
            key={it.label}
            href={`#${it.label.toLowerCase()}`}
            className="block px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70"
          >
            {it.label}
          </a>
        ))}
      </nav>
    </Card>
  );
}

function MarkdownEditor() {
  const [value, setValue] = useState(
    `# Título do Projeto\n\nBreve descrição.\n\n## Installation\n\n\`pnpm add readme-studio\`\n\n## Usage\n\n- Step 1\n- Step 2\n`,
  );
  return (
    <Card className="h-full">
      <SectionHeader
        title="Markdown Editor"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Wand2 className="h-4 w-4 mr-1" />Polish
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />Share preview
            </Button>
          </div>
        }
      />
      <div className="p-2">
        <div className="flex items-center gap-2 mb-2">
          <Button size="sm" variant="ghost">
            H1
          </Button>
          <Button size="sm" variant="ghost">
            H2
          </Button>
          <Button size="sm" variant="ghost">
            B
          </Button>
          <Button size="sm" variant="ghost">
            I
          </Button>
          <Button size="sm" variant="ghost">
            Code
          </Button>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full min-h-[360px] lg:min-h-[520px] resize-y rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3 font-mono text-sm outline-none"
          placeholder="# Start writing…"
        />
      </div>
    </Card>
  );
}

function MarkdownPreview() {
  return (
    <Card className="h-full">
      <SectionHeader
        title="Preview"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              GitHub
            </Button>
            <Button size="sm" variant="ghost">
              Docs
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">README Studio</h1>
        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Beautiful editor and preview to craft world-class READMEs. Add blocks, lint, generate TOC with emojis, and ship via PR.
        </p>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
            Installation
          </div>
          <pre className="p-4 text-sm bg-white/70 dark:bg-zinc-950/40">pnpm add readme-studio</pre>
        </div>
        <div>
          <h2 id="usage" className="text-xl font-semibold mb-2">
            Usage
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
            <li>Connect your GitHub App</li>
            <li>Pick a repo and fetch README</li>
            <li>Polish with AI and Blocks</li>
            <li>Create PR and share preview</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

function StatusBar() {
  return (
    <div className="mt-4">
      <div className="mx-auto max-w-[1400px] px-4">
        <Card className="px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-4">
          <span>
            Branch: <b>main</b>
          </span>
          <span className="hidden sm:inline">Lint: 0 errors</span>
          <span className="hidden md:inline">Preview: GitHub • Light</span>
        </Card>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Root page component
// ————————————————————————————————————————————————————————————

export default function TailwindReadmeStudioDemo() {
  const [dark, setDark] = useState(false);
  const rootClass = useMemo(() => (dark ? 'dark' : undefined), [dark]);

  return (
    <div className={rootClass}>
      {/* Background */}
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_45%),radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_45%),radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.06),transparent_50%)]">
        <Topbar dark={dark} setDark={setDark} />

        <main className="mx-auto max-w-[1400px] px-4 pb-10">
          <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-[280px,1fr] xl:grid-cols-[300px,1fr,440px]">
            {/* Sidebar */}
            <div className="space-y-4 order-1">
              <Navigator />
              <BlocksPalette />
            </div>

            {/* Editor */}
            <div className="order-3 lg:order-2 min-h-[520px]">
              <MarkdownEditor />
            </div>

            {/* Preview (hidden below xl) */}
            <div className="order-2 lg:order-3 hidden xl:block min-h-[520px]">
              <MarkdownPreview />
            </div>
          </div>

          <StatusBar />
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-xs text-zinc-500">
          Made with ♥ for your README flow — Connect • Edit • Preview • Ship
        </footer>
      </div>
    </div>
  );
}
