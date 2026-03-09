import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight Markdown renderer with Vasthu-friendly styles.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  if (!content) {
    return null;
  }

  const proseClassName = cn(
    'prose prose-slate prose-sm max-w-none',
    'prose-headings:text-slate-900 prose-headings:font-semibold',
    'prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-muted-foreground',
    'prose-strong:text-slate-900 prose-a:text-primary',
    className
  );

  return (
    <div className={proseClassName}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
