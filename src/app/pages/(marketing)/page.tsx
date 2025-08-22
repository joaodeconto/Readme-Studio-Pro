import Link from 'next/link';

export default function Marketing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center gap-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Polish and publish READMEs effortlessly</h1>
        <p className="text-lg text-gray-500 max-w-xl">
          Readme Studio Pro helps you create and improve README files with AI-powered tools and live preview.
        </p>
      </div>
      <div className="flex gap-4">
        <a
          href="/api/github/oauth/start"
          className="px-5 py-2 rounded bg-blue-600 text-white font-medium"
        >
          Connect GitHub
        </a>
        <Link
          href="/pages/templates"
          className="px-5 py-2 rounded border border-blue-600 text-blue-600"
        >
          Try demo without GitHub
        </Link>
      </div>
      <div className="flex gap-4 text-sm text-gray-500 mt-6">
        <Link href="/docs">Docs</Link>
        <Link href="/changelog">Changelog</Link>
        <Link href="/examples">Examples Gallery</Link>
      </div>
    </main>
  );
}