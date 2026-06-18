"use client";

import { useState, useTransition } from "react";
import { Gift } from "lucide-react";
import { adminGrantEntitlement } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

type GrantKind = "owner_plus" | "care_slot" | "shop_plan";

export function AdminGrantPanel() {
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState<GrantKind>("owner_plus");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function mapError(code: string): string {
    const map: Record<string, string> = {
      FORBIDDEN: t.admin.grantForbidden,
      EMAIL_REQUIRED: t.admin.grantEmailRequired,
      USER_NOT_FOUND: t.admin.grantUserNotFound,
      NOT_OWNER: t.admin.grantNotOwner,
      NOT_ORG: t.admin.grantNotOrg,
      NOT_FACILITY: t.admin.grantNotFacility,
      CAP_REACHED: t.admin.grantCapReached,
      BAD_REQUEST: t.admin.grantBadRequest,
    };
    return map[code] ?? code;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    start(async () => {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("kind", kind);
      const res = await adminGrantEntitlement(fd);
      if (res?.error) {
        setError(mapError(res.error));
        return;
      }
      if (res?.message) setNotice(res.message);
    });
  }

  const options: { id: GrantKind; label: string; hint: string }[] = [
    {
      id: "owner_plus",
      label: t.admin.grantOwnerPlus,
      hint: t.admin.grantOwnerPlusHint,
    },
    {
      id: "care_slot",
      label: t.admin.grantCareSlot,
      hint: t.admin.grantCareSlotHint,
    },
    {
      id: "shop_plan",
      label: t.admin.grantShopPlan,
      hint: t.admin.grantShopPlanHint,
    },
  ];

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Gift size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-forest">{t.admin.grantTitle}</h2>
      </div>
      <p className="mt-1 text-xs text-muted">{t.admin.grantDesc}</p>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            {t.admin.grantEmailLabel}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.admin.grantEmailPlaceholder}
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs font-medium text-slate-600">
            {t.admin.grantKindLabel}
          </legend>
          {options.map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                kind === o.id
                  ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-100"
                  : "border-border hover:border-brand-300"
              }`}
            >
              <input
                type="radio"
                name="grantKind"
                value={o.id}
                checked={kind === o.id}
                onChange={() => setKind(o.id)}
                className="mt-1 shrink-0"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{o.label}</span>
                <span className="block text-xs text-muted">{o.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        {notice && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          <Gift size={15} /> {pending ? "…" : t.admin.grantSubmit}
        </button>
      </form>
    </section>
  );
}
