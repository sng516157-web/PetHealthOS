"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Trash2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui";
import { addAttachment, deleteAttachment } from "@/app/actions";
import { ATTACHMENT_KINDS, ATTACHMENT_KIND_META, AttachmentKind } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/client";

export type SerializedAttachment = {
  id: string;
  kind: string;
  label: string;
  url: string;
  mimeType: string | null;
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

function isImage(a: SerializedAttachment) {
  return a.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(a.url);
}

export function DocumentsPanel({
  petId,
  attachments,
}: {
  petId: string;
  attachments: SerializedAttachment[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function upload(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await addAttachment(petId, formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteAttachment(petId, id);
      router.refresh();
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t.documents.title}</h3>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
        >
          <Plus size={14} /> {t.common.add}
        </button>
      </div>
      <p className="mt-0.5 text-xs text-muted">
        {t.documents.helper}
      </p>

      {open && (
        <form ref={formRef} action={upload} className="mt-3 space-y-2 rounded-xl border border-border bg-background p-3">
          <select name="kind" className={inputCls} defaultValue="VACCINE_CERT">
            {ATTACHMENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {t.attachmentKind[k as AttachmentKind]}
              </option>
            ))}
          </select>
          <input name="label" placeholder={t.documents.labelOptional} className={inputCls} />
          <input
            name="file"
            type="file"
            required
            accept="image/*,application/pdf"
            className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? t.documents.uploading : t.documents.upload}
          </button>
        </form>
      )}

      <div className="mt-3 space-y-2">
        {attachments.length === 0 && (
          <p className="py-2 text-center text-sm text-muted">{t.documents.none}</p>
        )}
        {attachments.map((a) => {
          const meta = ATTACHMENT_KIND_META[a.kind as AttachmentKind];
          return (
            <div key={a.id} className="group flex items-center gap-3 rounded-lg border border-border p-2">
              {isImage(a) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt={a.label} className="h-10 w-10 rounded-md object-cover ring-1 ring-border" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                  <FileText size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{a.label}</div>
                <div className="text-xs text-muted">{t.attachmentKind[a.kind as AttachmentKind] ?? meta?.label}</div>
              </div>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-50 hover:text-brand-600"
                aria-label="Open"
              >
                <ExternalLink size={15} />
              </a>
              <button
                onClick={() => remove(a.id)}
                className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                aria-label="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
