"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send } from "lucide-react";
import { addLogEntry } from "@/app/actions";
import { Card, Badge, Tone } from "@/components/ui";
import { LOG_TYPE_META, SEVERITY_META, LogType, Severity } from "@/lib/constants";

const SUGGESTIONS = [
  "Vomited once this morning, still active",
  "Ate full meal, energetic on walk",
  "Slight limp on back leg after playing",
  "Gave monthly flea & tick treatment",
];

export function QuickAddLog({ petId }: { petId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{
    type: string;
    severity: string;
    title: string;
    tags: string[];
  } | null>(null);

  function submit() {
    if (!text.trim()) return;
    const entry = text;
    startTransition(async () => {
      const res = await addLogEntry(petId, entry);
      if (res?.ok && res.structured) {
        setLastResult({
          type: res.structured.type,
          severity: res.structured.severity,
          title: res.structured.title,
          tags: res.structured.tags,
        });
        setText("");
        router.refresh();
      }
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles size={16} className="text-brand-500" />
        Log a note
        <span className="ml-auto text-xs font-normal text-muted">
          AI structures it automatically
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        rows={3}
        placeholder="Just write naturally — e.g. 'Threw up after breakfast, seems a bit tired but drinking water'"
        className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setText(s)}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-slate-500 transition hover:border-brand-300 hover:text-brand-700"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400">⌘/Ctrl + Enter to save</span>
        <button
          onClick={submit}
          disabled={pending || !text.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? (
            <>
              <Sparkles size={15} className="animate-pulse-dot" /> Structuring…
            </>
          ) : (
            <>
              <Send size={15} /> Save entry
            </>
          )}
        </button>
      </div>

      {lastResult && (
        <div className="mt-3 animate-fade-in rounded-xl border border-brand-100 bg-brand-50/60 p-3">
          <div className="flex items-center gap-2 text-xs text-brand-700">
            <Sparkles size={13} /> Saved &amp; structured as:
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="slate">
              {LOG_TYPE_META[lastResult.type as LogType].emoji}{" "}
              {LOG_TYPE_META[lastResult.type as LogType].label}
            </Badge>
            <Badge tone={SEVERITY_META[lastResult.severity as Severity].color as Tone}>
              {SEVERITY_META[lastResult.severity as Severity].label}
            </Badge>
            {lastResult.tags.map((t) => (
              <span key={t} className="text-xs text-muted">
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
