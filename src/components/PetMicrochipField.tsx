"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check } from "lucide-react";
import { updatePetMicrochip } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import {
  validateMicrochip,
  type VErrCode,
} from "@/lib/validation";

const inputCls =
  "min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function PetMicrochipField({
  petId,
  microchip,
  canEdit,
}: {
  petId: string;
  microchip: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(microchip ?? "");
  const [fieldErr, setFieldErr] = useState<VErrCode | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canEdit && !microchip) return null;

  function openEdit() {
    setValue(microchip ?? "");
    setFieldErr(null);
    setEditing(true);
  }

  function cancel() {
    setValue(microchip ?? "");
    setFieldErr(null);
    setEditing(false);
  }

  function save() {
    const err = validateMicrochip(value);
    if (err) {
      setFieldErr(err);
      return;
    }
    setFieldErr(null);
    const fd = new FormData();
    fd.set("microchip", value);
    startTransition(async () => {
      const res = await updatePetMicrochip(petId, fd);
      if (res && "error" in res && res.error) {
        const code = res.error as VErrCode;
        if (code in t.validation) setFieldErr(code);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  const label = t.petDetail.microchip;

  if (!canEdit) {
    return (
      <p className="mt-1 text-xs text-muted">
        <span className="font-medium text-slate-600">{label}:</span>{" "}
        <span className="font-mono text-ink/80">{microchip}</span>
      </p>
    );
  }

  if (editing) {
    return (
      <div className="mt-2 max-w-md">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <div className="mt-1 flex items-center gap-1.5">
          <input
            name="microchip"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t.petDetail.microchipPlaceholder}
            className={inputCls}
            autoFocus
            disabled={pending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") cancel();
            }}
          />
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="shrink-0 rounded-lg bg-brand-600 p-1.5 text-white disabled:opacity-50"
            aria-label={t.petDetail.microchipSave}
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="shrink-0 rounded-lg border border-border p-1.5 text-slate-500"
            aria-label={t.common.cancel}
          >
            <X size={14} />
          </button>
        </div>
        <FieldError code={fieldErr} />
        <p className="mt-1 text-[10px] text-muted">{t.petDetail.microchipHint}</p>
      </div>
    );
  }

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <span>
        <span className="font-medium text-slate-600">{label}:</span>{" "}
        {microchip ? (
          <span className="font-mono text-ink/80">{microchip}</span>
        ) : (
          <span className="text-slate-400">{t.petDetail.microchipEmpty}</span>
        )}
      </span>
      <button
        type="button"
        onClick={openEdit}
        className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800"
      >
        <Pencil size={11} />
        {microchip ? t.petDetail.microchipEdit : t.petDetail.microchipAdd}
      </button>
    </p>
  );
}
