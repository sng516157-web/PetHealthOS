"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Copy, Check, Send } from "lucide-react";
import { createTransfer } from "@/app/actions";
import { Card } from "@/components/ui";
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

  const link =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/passport/${token}`
      : token
        ? `/passport/${token}`
        : null;

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await createTransfer(petId, formData);
      if (res?.token) {
        setToken(res.token);
        router.refresh();
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
