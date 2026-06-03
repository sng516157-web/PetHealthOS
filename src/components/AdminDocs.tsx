"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, History } from "lucide-react";
import type { DocFile } from "@/lib/docs";
import { useI18n } from "@/lib/i18n/client";

// Mirror of lib/docs UPDATES_FILE (kept local so this client component never
// imports the fs-based docs module into the browser bundle).
const UPDATES_FILE = "UPDATES.md";

// Read-only markdown rendering for project docs (richer than the chat Markdown
// component — keeps real heading sizes for readability).
function DocMarkdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="mb-3 mt-5 text-lg font-bold text-forest first:mt-0" {...props} />
          ),
          h2: (props) => (
            <h2 className="mb-2 mt-5 text-base font-semibold text-forest first:mt-0" {...props} />
          ),
          h3: (props) => (
            <h3 className="mb-1.5 mt-4 text-sm font-semibold text-foreground" {...props} />
          ),
          p: (props) => <p className="mb-2.5 last:mb-0" {...props} />,
          ul: (props) => (
            <ul className="mb-2.5 list-disc space-y-1 pl-5 last:mb-0" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-2.5 list-decimal space-y-1 pl-5 last:mb-0" {...props} />
          ),
          li: (props) => <li className="marker:text-slate-400" {...props} />,
          strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
          em: (props) => <em className="italic" {...props} />,
          a: (props) => (
            <a
              className="font-medium text-brand-600 underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          hr: () => <hr className="my-4 border-border" />,
          code: (props) => (
            <code className="rounded bg-black/10 px-1 py-0.5 text-[0.85em]" {...props} />
          ),
          pre: (props) => (
            <pre
              className="mb-2.5 overflow-x-auto rounded-xl bg-ink/90 p-3 text-xs text-white"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="my-2.5 border-l-2 border-brand-300 pl-3 text-slate-600"
              {...props}
            />
          ),
          table: (props) => (
            <div className="mb-2.5 overflow-x-auto">
              <table className="w-full border-collapse text-xs" {...props} />
            </div>
          ),
          th: (props) => (
            <th className="border border-border bg-paper px-2 py-1 text-left font-semibold" {...props} />
          ),
          td: (props) => <td className="border border-border px-2 py-1 align-top" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function AdminDocs({ docs }: { docs: DocFile[] }) {
  const { t } = useI18n();
  const updates = docs.find((d) => d.name === UPDATES_FILE) ?? null;
  // The documentation browser shows every doc except the pinned updates log.
  const browseable = docs.filter((d) => d.name !== UPDATES_FILE);
  const [selected, setSelected] = useState(browseable[0]?.name ?? "");
  const active = browseable.find((d) => d.name === selected) ?? browseable[0];

  return (
    <div className="space-y-10">
      {/* Updates log */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-forest">
          <History size={15} /> {t.admin.updatesTitle}
        </h2>
        <p className="mt-0.5 text-xs text-muted">{t.admin.updatesDesc}</p>
        <div className="mt-3 max-h-[28rem] overflow-y-auto rounded-2xl border border-border bg-surface p-5">
          {updates ? (
            <DocMarkdown>{updates.content}</DocMarkdown>
          ) : (
            <p className="text-sm text-muted">{t.admin.docsEmpty}</p>
          )}
        </div>
      </section>

      {/* Documentation browser */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-forest">
          <FileText size={15} /> {t.admin.docsTitle}
        </h2>
        <p className="mt-0.5 text-xs text-muted">{t.admin.docsDesc}</p>

        {browseable.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
            {t.admin.docsEmpty}
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {browseable.map((d) => (
                <button
                  key={d.name}
                  onClick={() => setSelected(d.name)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active?.name === d.name
                      ? "bg-brand-600 text-white"
                      : "border border-border bg-surface text-slate-600 hover:border-brand-300 hover:text-brand-700"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <div className="mt-3 max-h-[40rem] overflow-y-auto rounded-2xl border border-border bg-surface p-5">
              {active && <DocMarkdown>{active.content}</DocMarkdown>}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
