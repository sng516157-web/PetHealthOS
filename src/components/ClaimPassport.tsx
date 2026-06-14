"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import { claimPassport } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import {
  validateEmail,
  validatePassword,
  validateRequiredName,
  validationMessage,
  VErr,
} from "@/lib/validation";
import { trackSignUp } from "@/lib/analytics";
import { LegalAcceptField, isLegalAccepted } from "@/components/LegalAcceptField";

export function ClaimPassport({
  token,
  petName,
}: {
  token: string;
  petName: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{
    name?: string | null;
    email?: string | null;
    password?: string | null;
    legal?: string | null;
  }>({});

  function submit(formData: FormData) {
    setError(null);
    const fe = {
      name: validateRequiredName(String(formData.get("claimedByName") || "")),
      email: validateEmail(String(formData.get("email") || "")),
      password: validatePassword(String(formData.get("password") || "")),
      legal: isLegalAccepted(formData) ? null : VErr.LEGAL_ACCEPT_REQUIRED,
    };
    setFieldErr(fe);
    if (fe.name || fe.email || fe.password || fe.legal) return;
    startTransition(async () => {
      const res = await claimPassport(token, formData);
      if (res?.error) {
        if (res.error === VErr.EMAIL_INVALID) {
          setFieldErr((p) => ({ ...p, email: res.error }));
        } else if (res.error === VErr.LEGAL_ACCEPT_REQUIRED) {
          setFieldErr((p) => ({ ...p, legal: res.error }));
        } else {
          setError(
            validationMessage(
              t.validation as unknown as Record<string, string>,
              res.error,
              res.error,
            ),
          );
        }
      } else {
        trackSignUp("owner");
        router.push(res?.needsVerification ? "/verify-email" : "/me");
      }
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
      <form action={submit} noValidate className="mx-auto max-w-sm space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-800">
            {t.claim.yourName}
          </label>
          <input
            name="claimedByName"
            placeholder={t.claim.yourNamePlaceholder}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <FieldError code={fieldErr.name} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-800">
            {t.auth.email}
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t.claim.emailPlaceholder}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <FieldError code={fieldErr.email} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-800">
            {t.auth.password}
          </label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder={t.claim.passwordPlaceholder}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <FieldError code={fieldErr.password} />
        </div>
        <LegalAcceptField t={t} error={fieldErr.legal} />
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
