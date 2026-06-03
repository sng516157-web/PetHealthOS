"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, FileText, ExternalLink } from "lucide-react";
import { reviewOrg } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export type AdminOrg = {
  id: string;
  name: string;
  kind: string;
  status: string;
  docType: string | null;
  note: string | null;
  reviewNote: string | null;
  submittedAt: string | null;
  hasDoc: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  UNVERIFIED: "bg-slate-100 text-slate-600",
};

export function AdminReviewItem({ org }: { org: AdminOrg }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function statusLabel(s: string): string {
    if (s === "PENDING") return t.admin.statusPending;
    if (s === "APPROVED") return t.admin.statusApproved;
    if (s === "REJECTED") return t.admin.statusRejected;
    return t.admin.statusUnverified;
  }

  function decide(decision: "APPROVED" | "REJECTED") {
    setError(null);
    if (decision === "APPROVED" && !confirm(t.admin.confirmApprove)) return;
    start(async () => {
      const fd = new FormData();
      fd.set("orgId", org.id);
      fd.set("decision", decision);
      fd.set("note", reason);
      const res = await reviewOrg(fd);
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
          <h3 className="text-sm font-semibold text-foreground">{org.name}</h3>
          <p className="text-xs text-muted">
            {t.admin.kind}: {org.kind}
            {org.submittedAt ? ` · ${t.admin.submitted}: ${org.submittedAt}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[org.status] ?? STATUS_STYLES.UNVERIFIED}`}
        >
          {statusLabel(org.status)}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
        <p className="flex items-center gap-1.5">
          <FileText size={13} className="text-slate-400" />
          {t.admin.docType}:{" "}
          {org.docType === "ALT" ? t.admin.docAlt : t.admin.docLicense}
        </p>
        {org.note && (
          <p>
            <span className="font-medium">{t.admin.note}: </span>
            {org.note}
          </p>
        )}
        {org.hasDoc && (
          <a
            href={`/api/admin/doc/${org.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
          >
            <ExternalLink size={13} /> {t.admin.viewDoc}
          </a>
        )}
      </div>

      {org.status === "REJECTED" && org.reviewNote && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {org.reviewNote}
        </p>
      )}

      {org.status !== "APPROVED" && (
        <div className="mt-4 space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder={t.admin.reasonPlaceholder}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => decide("APPROVED")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <Check size={13} /> {t.admin.approve}
            </button>
            <button
              onClick={() => decide("REJECTED")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            >
              <X size={13} /> {t.admin.reject}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
