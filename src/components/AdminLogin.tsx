"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { adminLogin } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export function AdminLogin() {
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await adminLogin(formData);
      if (res?.error) setError(t.admin.badPassword);
    });
  }

  return (
    <form action={submit} className="space-y-3">
      <input
        type="password"
        name="password"
        autoFocus
        placeholder={t.admin.password}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        <Lock size={15} /> {t.admin.signIn}
      </button>
    </form>
  );
}
