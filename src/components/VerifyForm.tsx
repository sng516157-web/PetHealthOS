"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, ShieldCheck, FileText } from "lucide-react";
import { submitVerification } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function VerifyForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function mapError(code: string): string {
    if (code === "NO_FILE") return t.verify.noFile;
    if (code === "FILE_TOO_LARGE") return t.verify.tooLarge;
    return t.verify.genericError;
  }

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await submitVerification(formData);
      if (res?.ok) {
        router.refresh();
        return;
      }
      if (res?.error) setError(mapError(res.error));
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="mb-1 text-xs font-medium text-muted">
          {t.verify.docTypeTitle}
        </legend>
        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/50">
          <input
            type="radio"
            name="docType"
            value="LICENSE"
            defaultChecked
            className="mt-0.5 accent-brand-600"
          />
          <span>
            <span className="font-medium text-foreground">{t.verify.license}</span>
            <span className="mt-0.5 block text-xs text-muted">{t.verify.licenseDesc}</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/50">
          <input
            type="radio"
            name="docType"
            value="ALT"
            className="mt-0.5 accent-brand-600"
          />
          <span>
            <span className="font-medium text-foreground">{t.verify.alt}</span>
            <span className="mt-0.5 block text-xs text-muted">{t.verify.altDesc}</span>
          </span>
        </label>
      </fieldset>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">
          {t.verify.fileLabel}
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-3 py-3 text-sm text-slate-600 transition hover:border-brand-400">
          {fileName ? <FileText size={18} className="text-brand-600" /> : <Upload size={18} className="text-slate-400" />}
          <span className="min-w-0 flex-1 truncate">
            {fileName ?? t.verify.fileLabel}
          </span>
          <input
            type="file"
            name="doc"
            accept="image/*,application/pdf"
            required
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">
          {t.verify.noteLabel}
        </label>
        <textarea
          name="note"
          rows={2}
          className={inputCls}
          placeholder={t.verify.notePlaceholder}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-[#b4503b]">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        <ShieldCheck size={15} /> {pending ? t.verify.submitting : t.verify.submit}
      </button>
    </form>
  );
}
