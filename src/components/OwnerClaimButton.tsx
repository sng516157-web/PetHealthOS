"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import { claimAsOwner } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

// Shown on a passport when an existing owner is already signed in: one tap to
// inherit the pet into their account — no re-entering email/password.
export function OwnerClaimButton({
  token,
  petName,
}: {
  token: string;
  petName: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function claim() {
    setError(null);
    start(async () => {
      const res = await claimAsOwner(token);
      if (res?.error) {
        setError(t.claim.addError);
        return;
      }
      router.push("/me");
    });
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5 text-center">
      <p className="text-sm font-medium text-brand-900">{t.claim.addToAccount(petName)}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-brand-800">{t.claim.addDesc}</p>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      <button
        onClick={claim}
        disabled={pending}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? (
          t.claim.adding
        ) : (
          <>
            <Heart size={15} /> {t.claim.addCta}
          </>
        )}
        {!pending && <Check size={15} className="hidden" />}
      </button>
    </div>
  );
}
