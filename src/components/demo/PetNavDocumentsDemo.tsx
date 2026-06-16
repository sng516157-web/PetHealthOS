"use client";

import { useMemo, useState } from "react";
import { ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import { DEMO_ATTACHMENTS } from "@/components/demo/pet-nav-demo-data";
import type { SerializedAttachment } from "@/components/DocumentsPanel";
import {
  ATTACHMENT_KINDS,
  ATTACHMENT_KIND_META,
  type AttachmentKind,
} from "@/lib/constants";
import { proxyImageSrc } from "@/lib/img";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

type CategoryFilter = "ALL" | AttachmentKind;

export function PetNavDocumentsDemo() {
  const { t } = useI18n();
  const [attachments, setAttachments] = useState(DEMO_ATTACHMENTS);
  const [category, setCategory] = useState<CategoryFilter>("ALL");

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

  function remove(id: string) {
    if (!confirm(t.documents.deleteConfirm)) return;
    setAttachments((a) => a.filter((x) => x.id !== id));
  }

  const categoryTabs: { id: CategoryFilter; label: string }[] = [
    { id: "ALL", label: t.documents.allCategories },
    ...ATTACHMENT_KINDS.map((k) => ({
      id: k as CategoryFilter,
      label: t.attachmentKind[k],
    })),
  ];

  return (
    <PetNavDemoChrome>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-forest">{t.documents.title}</h2>
            <p className="mt-0.5 text-xs text-muted">{t.documents.helper}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <Plus size={13} /> {t.common.add}
          </button>
        </div>

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

        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">{t.documents.noneInCategory}</p>
          ) : (
            filtered.map((a) => (
              <DocumentRow key={a.id} attachment={a} onDelete={() => remove(a.id)} />
            ))
          )}
        </div>
      </Card>
    </PetNavDemoChrome>
  );
}

function DocumentRow({
  attachment,
  onDelete,
}: {
  attachment: SerializedAttachment;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const meta = ATTACHMENT_KIND_META[attachment.kind as AttachmentKind];
  const isImage =
    attachment.mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.url);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxyImageSrc(attachment.url)}
          alt={attachment.label}
          className="h-11 w-11 rounded-lg object-cover ring-1 ring-border"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <FileText size={18} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-forest">{attachment.label}</div>
        <div className="text-xs text-muted">
          {meta.emoji} {t.attachmentKind[attachment.kind as AttachmentKind]}
        </div>
      </div>
      <a
        href={proxyImageSrc(attachment.url)}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-600"
        aria-label="Open"
      >
        <ExternalLink size={15} />
      </a>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
        aria-label={t.common.delete}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
