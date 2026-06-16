"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { requestPasswordReset } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import { validateEmail, VErr } from "@/lib/validation";

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-600";
const primaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60";

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function mapError(code: string): string {
    const map: Record<string, string> = {
      TOO_MANY_REQUESTS: t.forgotPassword.errors.TOO_MANY_REQUESTS,
      EMAIL_NOT_CONFIGURED: t.forgotPassword.errors.EMAIL_NOT_CONFIGURED,
      SEND_FAILED: t.forgotPassword.errors.SEND_FAILED,
      EMAIL_REQUIRED: t.validation.EMAIL_REQUIRED,
      EMAIL_INVALID: t.validation.EMAIL_INVALID,
    };
    return map[code] ?? code;
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const err = validateEmail(email);
    setEmailErr(err);
    if (err) return;

    start(async () => {
      const res = await requestPasswordReset(fd);
      if (res?.devLink) console.log("[email:dev] Reset link:", res.devLink);
      if (res?.devCode) console.log("[email:dev] Reset code:", res.devCode);
      if (res?.error) {
        setError(mapError(res.error));
        return;
      }
      router.push("/forgot-password?sent=1");
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label className={labelCls}>{t.auth.email}</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputCls}
          placeholder={t.auth.emailPlaceholder}
        />
        <FieldError code={emailErr} />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button type="submit" disabled={pending} className={primaryBtn}>
        <Mail size={15} /> {pending ? t.forgotPassword.sending : t.forgotPassword.submit}
      </button>
      <Link
        href="/login"
        className="block text-center text-xs text-muted underline hover:text-forest"
      >
        {t.forgotPassword.backToSignIn}
      </Link>
    </form>
  );
}
