"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { deleteAccount } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export function DeleteAccountPanel({
  scope,
  hasPassword,
}: {
  scope: "owner" | "org";
  hasPassword: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const desc =
    scope === "owner" ? t.account.deleteOwnerDesc : t.account.deleteOrgDesc;

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set("confirm", confirm);
    if (hasPassword) fd.set("password", password);
    startTransition(async () => {
      const res = await deleteAccount(fd);
      if (res?.error) {
        const map: Record<string, string> = {
          CONFIRM_MISMATCH: t.account.deleteConfirmMismatch,
          WRONG_PASSWORD: t.account.deleteWrongPassword,
          NOT_SIGNED_IN: t.account.deleteFailed,
          DELETE_FAILED: t.account.deleteFailed,
        };
        setError(map[res.error] ?? t.account.deleteFailed);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-rose-600" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-rose-900">
            {t.account.deleteTitle}
          </h2>
          <p className="mt-1 text-sm text-rose-800/90">{desc}</p>
          <ul className="mt-2 list-inside list-disc text-xs text-rose-800/80">
            {(scope === "owner"
              ? t.account.deleteBullets
              : t.account.deleteOrgBullets
            ).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
        >
          {t.account.deleteOpen}
        </button>
      ) : (
        <div className="mt-4 space-y-3 rounded-xl border border-rose-200 bg-white p-4">
          <p className="text-xs text-slate-600">{t.account.deleteConfirmHint}</p>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          {hasPassword && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.account.deletePasswordPlaceholder}
              autoComplete="current-password"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          )}
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                pending ||
                confirm !== "DELETE" ||
                (hasPassword && !password.trim())
              }
              onClick={submit}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
            >
              {pending ? "…" : t.account.deleteSubmit}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                setConfirm("");
                setPassword("");
                setError(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
