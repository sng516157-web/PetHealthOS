"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { confirmVerificationCode } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export function VerifyEmailCodeForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function mapError(codeKey: string): string {
    const map: Record<string, string> = {
      CODE_INVALID: t.verifyEmail.errors.CODE_INVALID,
      TOO_MANY_ATTEMPTS: t.verifyEmail.errors.TOO_MANY_ATTEMPTS,
      NOT_SIGNED_IN: t.verifyEmail.errors.NOT_SIGNED_IN,
    };
    return map[codeKey] ?? t.verifyEmail.errors.CODE_INVALID;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await confirmVerificationCode(code);
      if (res?.error) {
        setError(mapError(res.error));
        return;
      }
      const dest = res.accountType === "owner" ? "/me" : "/app";
      router.push(`${dest}?verified=1&account=${res.accountType}`);
    });
  }

  return (
    <form onSubmit={submit} className="mt-6 border-t border-border pt-6">
      <div className="mb-2 flex items-center justify-center gap-2 text-brand-600">
        <KeyRound size={16} />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t.verifyEmail.codeTitle}
        </span>
      </div>
      <p className="text-center text-xs leading-relaxed text-muted">{t.verifyEmail.codeDesc}</p>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-3 text-center font-mono text-2xl tracking-[0.35em] outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        aria-label={t.verifyEmail.codeLabel}
      />
      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs text-rose-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || code.length !== 6}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-brand-600 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
      >
        {pending ? "…" : t.verifyEmail.codeSubmit}
      </button>
    </form>
  );
}
