import ReactMarkdown from 'react-markdown';

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose-site space-y-4 text-base leading-relaxed text-parchment-400">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-cinzel text-3xl tracking-[0.08em] text-parchment-100">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 font-cinzel text-xl tracking-[0.1em] text-ember-400">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 font-cinzel text-lg tracking-[0.08em] text-parchment-200">
              {children}
            </h3>
          ),
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="text-parchment-200">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} className="text-ember-400 underline-offset-4 hover:underline">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
