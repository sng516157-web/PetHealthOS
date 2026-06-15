"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  closeOwnerPetRegular,
  closeOwnerPetDeceased,
  getOwnerDeathClosureEligibility,
} from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function ClosePetPanel({
  petId,
  petName,
  deathEligible: initialEligible,
  condolenceCreditUsd,
}: {
  petId: string;
  petName: string;
  deathEligible: boolean;
  condolenceCreditUsd: number;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"regular" | "deceased" | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deathEligible, setDeathEligible] = useState(initialEligible);

  const creditUsd = condolenceCreditUsd;

  function msg(code: string) {
    const map = t.petClosure.errors as Record<string, string>;
    return map[code] ?? code;
  }

  function openMode(next: "regular" | "deceased") {
    setError(null);
    setMode(next);
    if (next === "deceased" && !deathEligible) {
      start(async () => {
        const res = await getOwnerDeathClosureEligibility();
        setDeathEligible(res.eligible);
      });
    }
  }

  function submitRegular(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await closeOwnerPetRegular(petId, formData);
      if (res && "error" in res && res.error) {
        setError(msg(res.error));
        return;
      }
      router.push("/me");
      router.refresh();
    });
  }

  function submitDeceased(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await closeOwnerPetDeceased(petId, formData);
      if (res && "error" in res && res.error) {
        setError(msg(res.error));
        return;
      }
      router.push("/me?tab=memorial");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-foreground">{t.petClosure.title}</span>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>
      <p className="mt-1 text-xs text-muted">{t.petClosure.subtitle}</p>

      {open && (
        <div className="mt-4 space-y-3">
          {!mode && (
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => openMode("regular")}
                className="rounded-xl border border-border p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/50"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Trash2 size={15} className="text-slate-500" />
                  {t.petClosure.regularTitle}
                </div>
                <p className="mt-1 text-xs text-muted">{t.petClosure.regularDesc}</p>
              </button>
              <button
                type="button"
                onClick={() => openMode("deceased")}
                className="rounded-xl border border-border p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/50"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Heart size={15} className="text-rose-400" />
                  {t.petClosure.deceasedTitle}
                </div>
                <p className="mt-1 text-xs text-muted">{t.petClosure.deceasedDesc}</p>
              </button>
            </div>
          )}

          {mode === "regular" && (
            <form action={submitRegular} className="space-y-3 rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted">{t.petClosure.regularWarning(petName)}</p>
              <input
                name="confirm"
                placeholder={t.petClosure.confirmClosePlaceholder}
                className={inputCls}
                autoComplete="off"
              />
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-600"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {t.petClosure.regularSubmit}
                </button>
              </div>
            </form>
          )}

          {mode === "deceased" && (
            <form action={submitDeceased} className="space-y-3 rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted">{t.petClosure.deceasedWarning(petName)}</p>
              {!deathEligible ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {t.petClosure.deceasedNotEligible}
                </p>
              ) : (
                <>
                  <p className="text-xs text-brand-800">{t.petClosure.deceasedRefundHint(creditUsd)}</p>
                  <input name="note" placeholder={t.petClosure.notePlaceholder} className={inputCls} />
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted">
                      {t.petClosure.proofLabel}
                    </label>
                    <input
                      name="proof"
                      type="file"
                      required
                      multiple
                      accept="image/*,application/pdf"
                      className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700"
                    />
                    <p className="mt-1 text-[11px] text-muted">{t.petClosure.proofHint}</p>
                  </div>
                </>
              )}
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-600"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={pending || !deathEligible}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {t.petClosure.deceasedSubmit}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
