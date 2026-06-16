"use client";

import { useMemo, useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Trash2, ExternalLink, Pencil } from "lucide-react";
import { Card } from "@/components/ui";
import { proxyImageSrc } from "@/lib/img";
import { addAttachment, deleteAttachment, updateAttachment } from "@/app/actions";
import { ATTACHMENT_KINDS, ATTACHMENT_KIND_META, AttachmentKind } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

type CategoryFilter = "ALL" | AttachmentKind;

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

function DocumentForm({
  attachment,
  submitLabel,
  pendingLabel,
  onCancel,
  onSubmit,
  pending,
  error,
  fileRequired = true,
}: {
  attachment?: SerializedAttachment;
  submitLabel: string;
  pendingLabel: string;
  onCancel?: () => void;
  onSubmit: (formData: FormData) => void;
  pending: boolean;
  error: string | null;
  fileRequired?: boolean;
}) {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    onSubmit(formData);
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-2 rounded-xl border border-border bg-background p-3"
    >
      <select name="kind" className={inputCls} defaultValue={attachment?.kind ?? "VACCINE_CERT"}>
        {ATTACHMENT_KINDS.map((k) => (
          <option key={k} value={k}>
            {t.attachmentKind[k as AttachmentKind]}
          </option>
        ))}
      </select>
      <input
        name="label"
        defaultValue={attachment?.label}
        placeholder={t.documents.labelOptional}
        className={inputCls}
      />
      <input
        name="file"
        type="file"
        required={fileRequired}
        accept="image/*,application/pdf"
        className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700"
      />
      {!fileRequired && (
        <p className="text-[11px] text-muted">{t.documents.replaceFile}</p>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {t.common.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function DocumentsPanel({
  petId,
  attachments,
  readOnly = false,
}: {
  petId: string;
  attachments: SerializedAttachment[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(formData: FormData) {
    setError(null);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError(t.documents.chooseFile);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(t.documents.tooBig);
      return;
    }
    startTransition(async () => {
      const res = await addAttachment(petId, formData);
      if (res && "error" in res) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function saveEdit(id: string, formData: FormData) {
    setError(null);
    const file = formData.get("file");
    if (file instanceof File && file.size > 0 && file.size > 8 * 1024 * 1024) {
      setError(t.documents.tooBig);
      return;
    }
    startTransition(async () => {
      const res = await updateAttachment(petId, id, formData);
      if (res && "error" in res) {
        setError(res.error);
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm(t.documents.deleteConfirm)) return;
    startTransition(async () => {
      await deleteAttachment(petId, id);
      if (editingId === id) setEditingId(null);
      router.refresh();
    });
  }

  const filtered = useMemo(
    () =>
      category === "ALL"
        ? attachments
        : attachments.filter((a) => a.kind === category),
    [attachments, category],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: attachments.length };
    for (const k of ATTACHMENT_KINDS) {
      map[k] = attachments.filter((a) => a.kind === k).length;
    }
    return map;
  }, [attachments]);

  const categoryTabs: { id: CategoryFilter; label: string }[] = [
    { id: "ALL", label: t.documents.allCategories },
    ...ATTACHMENT_KINDS.map((k) => ({
      id: k as CategoryFilter,
      label: t.attachmentKind[k],
    })),
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t.documents.title}</h3>
        {!readOnly && (
          <button
            onClick={() => {
              setOpen((o) => !o);
              setEditingId(null);
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <Plus size={14} /> {t.common.add}
          </button>
        )}
      </div>
      <p className="mt-0.5 text-xs text-muted">{t.documents.helper}</p>

      {open && !readOnly && (
        <div className="mt-3">
          <DocumentForm
            submitLabel={t.documents.upload}
            pendingLabel={t.documents.uploading}
            onSubmit={upload}
            pending={pending}
            error={error}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {categoryTabs.map((tab) => {
          const active = category === tab.id;
          const count = counts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={cn(
                "relative shrink-0 px-3 py-2 text-xs font-medium transition",
                active ? "text-brand-700" : "text-slate-500 hover:text-foreground",
              )}
            >
              {tab.label}
              <span className="ml-1 text-[10px] text-muted">({count})</span>
              {active && (
                <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-brand-600" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-2">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            {attachments.length === 0 ? t.documents.none : t.documents.noneInCategory}
          </p>
        )}
        {filtered.map((a) => {
          if (editingId === a.id) {
            return (
              <div key={a.id}>
                <DocumentForm
                  attachment={a}
                  submitLabel={t.documents.saveChanges}
                  pendingLabel={t.documents.uploading}
                  onSubmit={(fd) => saveEdit(a.id, fd)}
                  pending={pending}
                  error={error}
                  fileRequired={false}
                  onCancel={() => {
                    setEditingId(null);
                    setError(null);
                  }}
                />
              </div>
            );
          }
          const meta = ATTACHMENT_KIND_META[a.kind as AttachmentKind];
          return (
            <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
              {isImage(a) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proxyImageSrc(a.url)}
                  alt={a.label}
                  className="h-10 w-10 rounded-md object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                  <FileText size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{a.label}</div>
                <div className="text-xs text-muted">
                  {t.attachmentKind[a.kind as AttachmentKind] ?? meta?.label}
                </div>
              </div>
              <a
                href={proxyImageSrc(a.url)}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-600"
                aria-label="Open"
              >
                <ExternalLink size={15} />
              </a>
              {!readOnly && (
                <>
                  <button
                    onClick={() => {
                      setEditingId(a.id);
                      setOpen(false);
                      setError(null);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-600"
                    aria-label={t.common.edit}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    aria-label={t.common.delete}
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
