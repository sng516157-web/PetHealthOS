"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Copy, Check, Send, Download } from "lucide-react";
import QRCode from "qrcode";
import { createTransfer } from "@/app/actions";
import { Card } from "@/components/ui";
import { GUARANTEE_TYPES, type GuaranteeType } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/client";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "block text-xs font-medium text-muted mb-1.5";

export function TransferForm({ petId }: { petId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guaranteeType, setGuaranteeType] = useState<GuaranteeType>("D30");
  const [vetChecked, setVetChecked] = useState(false);

  const link =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/passport/${token}`
      : token
        ? `/passport/${token}`
        : null;

  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, { margin: 1, width: 256 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [link]);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createTransfer(petId, formData);
      if (res?.token) {
        setToken(res.token);
        router.refresh();
      } else if (res?.error) {
        setError(
          res.error === "PASSPORT_NOT_ALLOWED"
            ? t.transferForm.notAllowed
            : res.error === "NOT_VERIFIED"
              ? t.transferForm.notVerified
              : res.error === "ALREADY_CLAIMED"
                ? t.transferForm.alreadyClaimed
                : res.error,
        );
      }
    });
  }

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (token && link) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <Check size={16} /> {t.transferForm.created}
        </div>
        <p className="mt-1 text-sm text-muted">
          {t.transferForm.shareDesc}
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
          <Link2 size={16} className="shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{link}</span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? t.transferForm.copied : t.transferForm.copy}
          </button>
        </div>
        {qr && (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="passport QR" className="h-40 w-40 rounded-lg" />
            <p className="text-center text-xs text-muted">{t.transferForm.qrHint}</p>
            <a
              href={qr}
              download="pet-health-passport-qr.png"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              <Download size={13} /> {t.transferForm.downloadQr}
            </a>
          </div>
        )}
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {t.transferForm.openPreview}
        </a>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <form action={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t.transferForm.newOwnerName}</label>
            <input name="newOwnerName" className={inputCls} placeholder={t.transferForm.newOwnerNamePlaceholder} />
          </div>
          <div>
            <label className={labelCls}>{t.transferForm.newOwnerEmail}</label>
            <input name="newOwnerEmail" type="email" className={inputCls} placeholder="owner@email.com" />
          </div>
        </div>
        <div>
          <label className={labelCls}>{t.transferForm.note}</label>
          <textarea name="note" rows={2} className={inputCls} placeholder={t.transferForm.notePlaceholder} />
        </div>

        <div>
          <label className={labelCls}>{t.transferForm.accessTitle}</label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/50">
              <input type="radio" name="visibility" value="READONLY_COPY" defaultChecked className="mt-0.5 accent-brand-600" />
              <span>
                <span className="font-medium text-foreground">{t.transferForm.keepReadonly}</span>
                <span className="mt-0.5 block text-xs text-muted">{t.transferForm.keepReadonlyDesc}</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/50">
              <input type="radio" name="visibility" value="SHARED" className="mt-0.5 accent-brand-600" />
              <span>
                <span className="font-medium text-foreground">{t.transferForm.shared}</span>
                <span className="mt-0.5 block text-xs text-muted">{t.transferForm.sharedDesc}</span>
              </span>
            </label>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/50">
          <input type="checkbox" name="claimable" defaultChecked className="mt-0.5 accent-brand-600" />
          <span>
            <span className="font-medium text-foreground">{t.transferForm.letClaim}</span>
            <span className="mt-0.5 block text-xs text-muted">
              {t.transferForm.letClaimDesc}
            </span>
          </span>
        </label>

        <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3">
          <label className={labelCls}>{t.transferForm.guaranteeTitle}</label>
          <p className="-mt-1 mb-2 text-xs text-muted">{t.transferForm.guaranteeDesc}</p>
          <select
            name="guaranteeType"
            value={guaranteeType}
            onChange={(e) => setGuaranteeType(e.target.value as GuaranteeType)}
            className={inputCls}
          >
            {GUARANTEE_TYPES.map((g) => (
              <option key={g} value={g}>
                {t.guaranteeType[g]}
              </option>
            ))}
          </select>
          {guaranteeType === "CUSTOM" && (
            <input
              name="guaranteeDays"
              type="number"
              min={1}
              className={`${inputCls} mt-2`}
              placeholder={t.transferForm.guaranteeDaysLabel}
            />
          )}
          {guaranteeType !== "NONE" && (
            <textarea
              name="guaranteeTerms"
              rows={2}
              className={`${inputCls} mt-2`}
              placeholder={t.transferForm.guaranteeTermsPlaceholder}
            />
          )}
        </div>

        <div className="rounded-xl border border-border p-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={vetChecked}
              onChange={(e) => setVetChecked(e.target.checked)}
              className="accent-brand-600"
            />
            {t.transferForm.vetCheckTitle}
          </label>
          {vetChecked && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t.transferForm.vetCheckDate}</label>
                <input name="vetCheckedAt" type="date" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.transferForm.vetCheckNoteLabel}</label>
                <input
                  name="vetCheckNote"
                  className={inputCls}
                  placeholder={t.transferForm.vetCheckNotePlaceholder}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-[#b4503b]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          <Send size={15} /> {pending ? t.transferForm.creating : t.transferForm.create}
        </button>
      </form>
    </Card>
  );
}
