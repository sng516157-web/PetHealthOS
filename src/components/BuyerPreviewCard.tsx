"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Link2, Eye } from "lucide-react";
import { ensurePetPreviewToken } from "@/app/actions";
import { Card } from "@/components/ui";
import { PassportShareButtons } from "@/components/PassportShareButtons";
import { useI18n } from "@/lib/i18n/client";

export function BuyerPreviewCard({
  petId,
  petName,
  initialToken,
}: {
  petId: string;
  petName: string;
  initialToken: string | null;
}) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);

  const link =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/preview/${token}`
      : token
        ? `/preview/${token}`
        : null;

  function generate() {
    startTransition(async () => {
      const res = await ensurePetPreviewToken(petId);
      if (res?.token) setToken(res.token);
    });
  }

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Eye size={16} className="text-brand-600" />
        {t.preview.title}
      </div>
      <p className="mt-1 text-sm text-muted">{t.preview.desc(petName)}</p>

      {!token ? (
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Link2 size={15} />
          {pending ? t.preview.generating : t.preview.generate}
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
            <Link2 size={16} className="shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{link}</span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? t.transferForm.copied : t.transferForm.copy}
            </button>
          </div>
          <PassportShareButtons url={link!} petName={petName} />
          <a
            href={link!}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {t.preview.open}
          </a>
        </div>
      )}
    </Card>
  );
}
