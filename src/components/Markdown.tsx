"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Compact markdown styling for chat / AI prose (no typography plugin needed).
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => <p className="mb-2 last:mb-0" {...props} />,
          ul: (props) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />
          ),
          li: (props) => <li className="marker:text-slate-400" {...props} />,
          strong: (props) => <strong className="font-semibold" {...props} />,
          em: (props) => <em className="italic" {...props} />,
          a: (props) => (
            <a
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          code: (props) => (
            <code
              className="rounded bg-black/10 px-1 py-0.5 text-[0.85em]"
              {...props}
            />
          ),
          h1: (props) => <p className="mb-1 font-semibold" {...props} />,
          h2: (props) => <p className="mb-1 font-semibold" {...props} />,
          h3: (props) => <p className="mb-1 font-semibold" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="my-2 border-l-2 border-current/30 pl-3 opacity-90"
              {...props}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
