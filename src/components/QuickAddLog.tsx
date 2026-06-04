"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, ImagePlus, X } from "lucide-react";
import { addLogEntry } from "@/app/actions";
import { Card, Badge, Tone } from "@/components/ui";
import { LOG_TYPE_META, SEVERITY_META, LogType, Severity } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/client";

export function QuickAddLog({ petId }: { petId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{
    type: string;
    severity: string;
    title: string;
    tags: string[];
  } | null>(null);

  const isImage = file?.type.startsWith("image/") ?? false;

  function pickFile(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function clearFile() {
    pickFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function submit() {
    if (!text.trim() && !file) return;
    const fd = new FormData();
    fd.set("rawText", text);
    if (file) fd.set("photo", file);
    startTransition(async () => {
      const res = await addLogEntry(petId, fd);
      if (res?.ok && res.structured) {
        setLastResult({
          type: res.structured.type,
          severity: res.structured.severity,
          title: res.structured.title,
          tags: res.structured.tags,
        });
        setText("");
        clearFile();
        router.refresh();
      }
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles size={16} className="text-brand-500" />
        {t.quickLog.title}
        <span className="ml-auto text-xs font-normal text-muted">
          {t.quickLog.aiStructures}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        rows={3}
        placeholder={t.quickLog.placeholder}
        className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
      />

      {preview && (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-2.5">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <video src={preview} className="h-16 w-16 rounded-lg object-cover" muted />
          )}
          <div className="min-w-0 flex-1 text-xs text-brand-800">
            <p className="truncate font-medium">{file?.name}</p>
            <p className="mt-0.5 text-muted">
              {!isImage
                ? t.quickLog.videoStored
                : text.trim()
                  ? t.quickLog.photoWithNote
                  : t.quickLog.photoNoNote}
            </p>
          </div>
          <button
            onClick={clearFile}
            className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-rose-500"
            aria-label={t.quickLog.removeMedia}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {t.quickLog.suggestions.map((s) => (
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
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
        >
          <ImagePlus size={15} /> {t.quickLog.addMedia}
        </button>
        <button
          onClick={submit}
          disabled={pending || (!text.trim() && !file)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? (
            <>
              <Sparkles size={15} className="animate-pulse-dot" />{" "}
              {file && isImage && text.trim()
                ? t.quickLog.analyzingPhoto
                : t.quickLog.structuring}
            </>
          ) : (
            <>
              <Send size={15} /> {t.quickLog.save}
            </>
          )}
        </button>
      </div>

      {lastResult && (
        <div className="mt-3 animate-fade-in rounded-xl border border-brand-100 bg-brand-50/60 p-3">
          <div className="flex items-center gap-2 text-xs text-brand-700">
            <Sparkles size={13} /> {t.quickLog.savedAs}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="slate">
              {LOG_TYPE_META[lastResult.type as LogType].emoji}{" "}
              {t.logType[lastResult.type as LogType]}
            </Badge>
            <Badge tone={SEVERITY_META[lastResult.severity as Severity].color as Tone}>
              {t.severity[lastResult.severity as Severity]}
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
