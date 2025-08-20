"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeSlug from 'rehype-slug';

export default function MdPreview({ value }: { value: string }) {
  return (
    <div className="prose prose-tight dark:prose-invert max-w-none h-[calc(100dvh-12rem)] overflow-auto border rounded p-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSlug]}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}