"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addOwnedPet } from "@/app/actions";
import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import {
  validateRequiredName,
  validateWeightKg,
  validatePastOrToday,
  validationMessage,
} from "@/lib/validation";

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "block text-xs font-medium text-muted mb-1.5";
const TODAY = new Date().toISOString().slice(0, 10);

export function OwnedPetForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{
    name?: string | null;
    weightKg?: string | null;
    birthDate?: string | null;
  }>({});
  const [quotaLimit, setQuotaLimit] = useState<number | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    setQuotaLimit(null);
    const fe = {
      name: validateRequiredName(String(formData.get("name") || "")),
      weightKg: validateWeightKg(String(formData.get("weightKg") || ""), false),
      birthDate: validatePastOrToday(String(formData.get("birthDate") || ""), false),
    };
    setFieldErr(fe);
    if (fe.name || fe.weightKg || fe.birthDate) return;
    startTransition(async () => {
      const res = await addOwnedPet(formData);
      if (res && "quota" in res && res.quota) {
        setQuotaLimit(res.limit ?? null);
        return;
      }
      if (res?.error) {
        setError(
          validationMessage(
            t.validation as unknown as Record<string, string>,
            res.error,
            res.error,
          ),
        );
        return;
      }
      if ("id" in res && res.id) router.push(`/me/pets/${res.id}`);
    });
  }

  return (
    <Card className="p-6">
      <form action={onSubmit} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>{t.newPet.name} *</label>
            <input name="name" className={inputCls} placeholder={t.newPet.namePlaceholder} />
            <FieldError code={fieldErr.name} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.species}</label>
            <select name="species" className={inputCls} defaultValue="DOG">
              <option value="DOG">{t.species.DOG}</option>
              <option value="CAT">{t.species.CAT}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.newPet.breed}</label>
            <input name="breed" className={inputCls} placeholder={t.newPet.breedPlaceholder} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.sex}</label>
            <select name="sex" className={inputCls} defaultValue="UNKNOWN">
              <option value="UNKNOWN">{t.sex.UNKNOWN}</option>
              <option value="MALE">{t.sex.MALE}</option>
              <option value="FEMALE">{t.sex.FEMALE}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.newPet.color}</label>
            <input name="color" className={inputCls} placeholder={t.newPet.colorPlaceholder} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.birthDate}</label>
            <input name="birthDate" type="date" max={TODAY} className={inputCls} />
            <FieldError code={fieldErr.birthDate} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.weight}</label>
            <input name="weightKg" type="number" step="0.1" min="0" max="200" className={inputCls} placeholder={t.newPet.weightPlaceholder} />
            <FieldError code={fieldErr.weightKg} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>
              {t.newPet.photo} <span className="font-normal normal-case">({t.common.optional})</span>
            </label>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-brand-700"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>{t.newPet.notes}</label>
            <textarea name="notes" rows={3} className={inputCls} placeholder={t.newPet.notesPlaceholder} />
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {quotaLimit !== null && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">{t.billing.quotaTitle}</p>
            <p className="mt-0.5 text-xs">{t.billing.quotaDesc(quotaLimit)}</p>
            <Link
              href="/me/billing"
              className="mt-2 inline-flex rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              {t.billing.upgrade}
            </Link>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? t.newPet.adding : t.common.addPet}
          </button>
        </div>
      </form>
    </Card>
  );
}
