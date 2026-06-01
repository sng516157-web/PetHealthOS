"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import { claimPassport } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export function ClaimPassport({
  token,
  petName,
  defaultName,
}: {
  token: string;
  petName: string;
  defaultName?: string | null;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await claimPassport(token, formData);
      if (res?.error) setError(res.error);
      else router.push("/me");
    });
  }

  if (!open) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5 text-center">
        <p className="text-sm font-medium text-brand-900">
          {t.claim.keepForLife(petName)}
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-brand-800">
          {t.claim.desc(petName)}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Heart size={15} /> {t.claim.claimKeep}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
      <form action={submit} className="mx-auto max-w-sm space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-800">
            {t.claim.yourName}
          </label>
          <input
            name="claimedByName"
            defaultValue={defaultName ?? ""}
            required
            placeholder={t.claim.yourNamePlaceholder}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-800">
            {t.auth.email}
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t.claim.emailPlaceholder}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-800">
            {t.auth.password}
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder={t.claim.passwordPlaceholder}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <p className="text-[11px] text-brand-700">
          {t.claim.accountNote}
        </p>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? (
            t.claim.claiming
          ) : (
            <>
              <Check size={15} /> {t.claim.confirm}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
