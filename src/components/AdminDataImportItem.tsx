"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import { completeDataImport } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { parseImportFileNames } from "@/lib/data-import-shared";

export type AdminDataImport = {
  id: string;
  status: string;
  accountLabel: string;
  submitterName: string;
  submitterEmail: string | null;
  orgName: string | null;
  fileNames: string;
  note: string | null;
  submittedAt: string | null;
};

export function AdminDataImportItem({ row }: { row: AdminDataImport }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const names = parseImportFileNames(row.fileNames);
  const done = row.status === "COMPLETED";

  function markComplete() {
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.set("importId", row.id);
      fd.set("adminNote", adminNote);
      const res = await completeDataImport(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{row.accountLabel}</h3>
          <p className="text-xs text-muted">
            {row.submitterName}
            {row.submitterEmail ? ` · ${row.submitterEmail}` : ""}
            {row.orgName ? ` · ${row.orgName}` : ""}
          </p>
          {row.submittedAt && (
            <p className="text-xs text-muted">
              {t.admin.submitted}: {row.submittedAt}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {row.status}
        </span>
      </div>

      {row.note && (
        <p className="mt-2 text-xs text-slate-600">
          <span className="font-medium">{t.admin.note}: </span>
          {row.note}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {names.map((name, i) => (
          <a
            key={`${row.id}-${i}`}
            href={`/api/admin/data-import/${row.id}/file/${i}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <ExternalLink size={12} />
            {name}
          </a>
        ))}
      </div>

      {!done && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <label className="block text-xs font-medium text-forest">
            {t.admin.dataImportAdminNote}
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={2}
            placeholder={t.admin.dataImportAdminNotePlaceholder}
            className="w-full rounded-lg border border-border px-3 py-2 text-xs"
          />
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          <button
            type="button"
            disabled={pending}
            onClick={markComplete}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <Check size={14} />
            {t.admin.dataImportMarkComplete}
          </button>
        </div>
      )}
    </div>
  );
}
