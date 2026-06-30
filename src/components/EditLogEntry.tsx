"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { updateLogEntry } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import type { SerializedLog } from "@/components/LogTimeline";

const inputCls =
  "w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function EditLogEntry({
  petId,
  entry,
  onClose,
}: {
  petId: string;
  entry: SerializedLog;
  onClose: () => void;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [text, setText] = useState(entry.rawText);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useBodyScrollLock(true);

  function save() {
    if (!text.trim()) return;
    setError(null);
    const fd = new FormData();
    fd.set("rawText", text);
    fd.set("locale", locale);
    start(async () => {
      const res = await updateLogEntry(petId, entry.id, fd);
      if (res?.error) {
        setError(
          res.error === "LOCKED" ? t.timeline.lockedError : res.error,
        );
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:items-center">
      <div
        className="w-full max-w-lg max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-soft"
        role="dialog"
        aria-labelledby="edit-log-title"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 id="edit-log-title" className="text-sm font-semibold text-forest">
            {t.timeline.editEntry}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-slate-100"
            aria-label={t.common.cancel}
          >
            <X size={16} />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className={`${inputCls} mt-3`}
        />
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-slate-600"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Pencil size={14} /> {pending ? "…" : t.timeline.saveEdit}
          </button>
        </div>
      </div>
    </div>
  );
}
