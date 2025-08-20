"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import remarkBreaks from 'remark-breaks';

export default function MdPreview({ value }: { value: string }) {
  return (
    <div className="prose prose-tight dark:prose-invert max-w-none h-[calc(100dvh-12rem)] overflow-auto border rounded p-4">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkSlug, remarkBreaks]}>
        {value}
      </ReactMarkdown>
    </div>
  );
}