"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { adminMarkEmailVerified } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export type AdminUnverifiedUser = {
  id: string;
  email: string | null;
  name: string;
  createdAt: string;
  accountLabel: string;
  emailsSent: number;
};

export function AdminUnverifiedItem({ user }: { user: AdminUnverifiedUser }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();

  function verify() {
    if (!confirm(t.admin.unverifiedConfirm(user.email ?? user.name))) return;
    start(async () => {
      const fd = new FormData();
      fd.set("userId", user.id);
      const res = await adminMarkEmailVerified(fd);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-forest">
            {user.email ?? "—"}
          </p>
          <p className="text-xs text-muted">
            {user.name} · {user.accountLabel} · {user.createdAt}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {t.admin.unverifiedEmailsSent(user.emailsSent)}
          </p>
        </div>
        <button
          type="button"
          onClick={verify}
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
        >
          <CheckCircle2 size={14} />
          {pending ? "…" : t.admin.unverifiedMarkVerified}
        </button>
      </div>
    </div>
  );
}
