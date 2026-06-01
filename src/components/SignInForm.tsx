"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { signIn } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export function SignInForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signIn(formData);
      if (res?.error) setError(res.error);
      else router.push("/me");
    });
  }

  return (
    <form action={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          {t.auth.email}
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          {t.auth.password}
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        <LogIn size={15} /> {pending ? t.auth.signingIn : t.auth.signIn}
      </button>
    </form>
  );
}
