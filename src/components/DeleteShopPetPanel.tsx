"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { deleteShopPet } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function DeleteShopPetPanel({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function msg(code: string) {
    const map = t.petClosure.errors as Record<string, string>;
    return map[code] ?? code;
  }

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await deleteShopPet(petId, formData);
      if (res && "error" in res && res.error) {
        setError(msg(res.error));
        return;
      }
      router.push("/app/pets");
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
        <span className="text-sm font-semibold text-foreground">{t.petClosure.shopDeleteTitle}</span>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>
      <p className="mt-1 text-xs text-muted">{t.petClosure.shopDeleteSubtitle}</p>

      {open && (
        <form action={submit} className="mt-4 space-y-3 rounded-xl border border-border bg-background p-3">
          <p className="text-xs text-muted">{t.petClosure.shopDeleteWarning(petName)}</p>
          <input
            name="confirm"
            placeholder={t.petClosure.confirmDeletePlaceholder}
            className={inputCls}
            autoComplete="off"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            <Trash2 size={13} /> {t.petClosure.shopDeleteSubmit}
          </button>
        </form>
      )}
    </div>
  );
}
