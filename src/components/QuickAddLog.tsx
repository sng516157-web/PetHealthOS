"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, ImagePlus, X, AlertTriangle } from "lucide-react";
import { addLogEntry } from "@/app/actions";
import { Card, Badge, Tone } from "@/components/ui";
import { LOG_TYPE_META, SEVERITY_META, LOG_BUCKET_META, LogType, Severity, LogBucket } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/client";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type SavedEntry = {
  route: LogBucket;
  title: string;
  type?: string;
  severity?: string;
  tags?: string[];
  mealType?: string;
  activityType?: string;
};

export function QuickAddLog({
  petId,
  ownerConfirm = false,
}: {
  petId: string;
  ownerConfirm?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastResults, setLastResults] = useState<SavedEntry[]>([]);

  useBodyScrollLock(confirmOpen);

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

  function doSubmit() {
    if (!text.trim() && !file) return;
    const fd = new FormData();
    fd.set("rawText", text);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) fd.set("timeZone", tz);
    fd.set("locale", locale);
    if (file) fd.set("photo", file);
    start(async () => {
      const res = await addLogEntry(petId, fd);
      if (res?.ok) {
        if (res.entries?.length) {
          setLastResults(res.entries);
        } else if (res.route === "health" && res.structured) {
          setLastResults([
            {
              route: "health",
              title: res.structured.title,
              type: res.structured.type,
              severity: res.structured.severity,
              tags: res.structured.tags,
            },
          ]);
        }
        setText("");
        clearFile();
        setConfirmOpen(false);
        router.refresh();
      }
    });
  }

  function submit() {
    if (!text.trim() && !file) return;
    if (ownerConfirm) {
      setConfirmOpen(true);
      return;
    }
    doSubmit();
  }

  return (
    <>
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
              type="button"
              onClick={clearFile}
              className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-rose-500"
              aria-label={t.quickLog.removeMedia}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            <ImagePlus size={15} /> {t.quickLog.addMedia}
          </button>
          <button
            type="button"
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

        {lastResults.length > 0 && (
          <div className="mt-3 animate-fade-in rounded-xl border border-brand-100 bg-brand-50/60 p-3">
            <div className="flex items-center gap-2 text-xs text-brand-700">
              <Sparkles size={13} />{" "}
              {lastResults.length === 1
                ? t.quickLog.savedAs
                : t.quickLog.savedCount(lastResults.length)}
            </div>
            <ul className="mt-2 space-y-2">
              {lastResults.map((entry, i) => (
                <li key={`${entry.route}-${entry.title}-${i}`} className="flex flex-wrap items-center gap-2">
                  <Badge tone={LOG_BUCKET_META[entry.route].color as Tone}>
                    {LOG_BUCKET_META[entry.route].emoji} {t.logBucket[entry.route]}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{entry.title}</span>
                  {entry.route === "health" && entry.type && (
                    <>
                      <Badge tone="slate">
                        {LOG_TYPE_META[entry.type as LogType].emoji}{" "}
                        {t.logType[entry.type as LogType]}
                      </Badge>
                      {entry.severity && entry.severity !== "NONE" && (
                        <Badge tone={SEVERITY_META[entry.severity as Severity].color as Tone}>
                          {t.severity[entry.severity as Severity]}
                        </Badge>
                      )}
                    </>
                  )}
                  {entry.route === "food" && entry.mealType && (
                    <Badge tone="amber">
                      {t.mealType[entry.mealType as keyof typeof t.mealType]}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:items-center">
          <div className="w-full max-w-md max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-forest">
                  {t.quickLog.ownerSaveTitle}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {t.quickLog.ownerSaveWarning}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-slate-600"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={doSubmit}
                disabled={pending}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pending ? "…" : t.quickLog.confirmSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
