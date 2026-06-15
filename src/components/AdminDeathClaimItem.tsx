"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ExternalLink } from "lucide-react";
import { reviewDeathClaim } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { parseProofDocUrls } from "@/lib/pet-closure-shared";

export type AdminDeathClaim = {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  status: string;
  proofDocUrls: string;
  applicantNote: string | null;
  reviewNote: string | null;
  submittedAt: string | null;
};

export function AdminDeathClaimItem({ claim }: { claim: AdminDeathClaim }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const proofs = parseProofDocUrls(claim.proofDocUrls);

  function decide(decision: "APPROVED" | "REJECTED") {
    setError(null);
    if (decision === "APPROVED" && !confirm(t.admin.deathClaimConfirmApprove)) return;
    start(async () => {
      const fd = new FormData();
      fd.set("claimId", claim.id);
      fd.set("decision", decision);
      fd.set("note", reason);
      const res = await reviewDeathClaim(fd);
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
          <h3 className="text-sm font-semibold text-foreground">
            {claim.petName} — {claim.ownerName}
          </h3>
          {claim.submittedAt && (
            <p className="text-xs text-muted">
              {t.admin.submitted}: {claim.submittedAt}
            </p>
          )}
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
          {claim.status}
        </span>
      </div>

      {claim.applicantNote && (
        <p className="mt-2 text-xs text-slate-600">
          <span className="font-medium">{t.admin.note}: </span>
          {claim.applicantNote}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {proofs.map((_, i) => (
          <a
            key={i}
            href={`/api/admin/death-claim/${claim.id}/doc/${i}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <ExternalLink size={12} /> {t.admin.deathClaimProof(i + 1)}
          </a>
        ))}
      </div>

      {claim.status === "REJECTED" && claim.reviewNote && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {claim.reviewNote}
        </p>
      )}

      {claim.status === "PENDING" && (
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
              <Check size={13} /> {t.admin.deathClaimApprove}
            </button>
            <button
              onClick={() => decide("REJECTED")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            >
              <X size={13} /> {t.admin.deathClaimReject}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
