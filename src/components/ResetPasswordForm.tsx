"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { resetPassword } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import { validateEmail, validatePassword, VErr } from "@/lib/validation";

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-600";
const primaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60";

export function ResetPasswordForm({
  token,
  tokenInvalid,
}: {
  token?: string;
  tokenInvalid?: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [fieldErr, setFieldErr] = useState<{
    email?: string | null;
    code?: string | null;
    password?: string | null;
    confirm?: string | null;
  }>({});
  const [error, setError] = useState<string | null>(null);

  const useToken = Boolean(token?.trim());

  function mapError(code: string): string {
    const map: Record<string, string> = {
      TOKEN_MISSING: t.resetPassword.errors.TOKEN_MISSING,
      TOKEN_INVALID: t.resetPassword.errors.TOKEN_INVALID,
      CODE_INVALID: t.resetPassword.errors.CODE_INVALID,
      TOO_MANY_ATTEMPTS: t.resetPassword.errors.TOO_MANY_ATTEMPTS,
      PASSWORD_MISMATCH: t.resetPassword.errors.PASSWORD_MISMATCH,
    };
    return map[code] ?? code;
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const code = String(fd.get("code") || "");
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");

    const fe = {
      email: useToken ? null : validateEmail(email),
      code: useToken ? null : !/^\d{6}$/.test(code.replace(/\s/g, "")) ? VErr.CODE_FORMAT : null,
      password: validatePassword(password),
      confirm:
        password && confirm && password !== confirm ? "PASSWORD_MISMATCH" : !confirm ? VErr.PASSWORD_REQUIRED : null,
    };
    setFieldErr(fe);
    if (fe.email || fe.code || fe.password || fe.confirm) return;

    if (useToken && token) fd.set("token", token);

    start(async () => {
      const res = await resetPassword(fd);
      if (res?.error) {
        setError(mapError(res.error));
        return;
      }
      const dest =
        res && "needsVerification" in res && res.needsVerification
          ? "/verify-email"
          : res.accountType === "owner"
            ? "/me"
            : "/app";
      router.push(dest);
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {tokenInvalid && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-center text-xs text-rose-700">
          {t.resetPassword.errors.TOKEN_INVALID}
        </p>
      )}

      {!useToken && (
        <>
          <div>
            <label className={labelCls}>{t.auth.email}</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className={inputCls}
              placeholder={t.auth.emailPlaceholder}
            />
            <FieldError code={fieldErr.email} />
          </div>
          <div>
            <label className={labelCls}>{t.resetPassword.codeLabel}</label>
            <input
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className={`${inputCls} text-center font-mono tracking-[0.35em]`}
              placeholder="000000"
            />
            <FieldError code={fieldErr.code} />
          </div>
        </>
      )}

      <div>
        <label className={labelCls}>{t.resetPassword.newPassword}</label>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          className={inputCls}
          placeholder={t.auth.createPasswordPlaceholder}
        />
        <FieldError code={fieldErr.password} />
      </div>
      <div>
        <label className={labelCls}>{t.resetPassword.confirmPassword}</label>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          className={inputCls}
        />
        {fieldErr.confirm === "PASSWORD_MISMATCH" && (
          <p className="mt-1 text-xs text-alert">{t.resetPassword.errors.PASSWORD_MISMATCH}</p>
        )}
        {fieldErr.confirm === VErr.PASSWORD_REQUIRED && (
          <FieldError code={fieldErr.confirm} />
        )}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button type="submit" disabled={pending || tokenInvalid} className={primaryBtn}>
        <KeyRound size={15} /> {pending ? t.resetPassword.saving : t.resetPassword.submit}
      </button>

      <Link
        href="/forgot-password"
        className="block text-center text-xs text-muted underline hover:text-forest"
      >
        {t.resetPassword.requestNew}
      </Link>
      <Link
        href="/login"
        className="block text-center text-xs text-muted underline hover:text-forest"
      >
        {t.forgotPassword.backToSignIn}
      </Link>
    </form>
  );
}
