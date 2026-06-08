"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addPet } from "@/app/actions";
import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import {
  validateRequiredName,
  validateWeightKg,
  validatePetDates,
  validatePetSex,
  validatePetPhoto,
  validationMessage,
  VErr,
} from "@/lib/validation";

const TODAY = new Date().toISOString().slice(0, 10);

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "block text-xs font-medium text-muted mb-1.5";

export type ParentOption = {
  id: string;
  name: string;
  species: string;
  sex: string | null;
  breed: string | null;
};

export function NewPetForm({ parents }: { parents: ParentOption[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{
    name?: string | null;
    breed?: string | null;
    color?: string | null;
    sex?: string | null;
    birthDate?: string | null;
    intakeAt?: string | null;
    dates?: string | null;
    weightKg?: string | null;
    photo?: string | null;
  }>({});
  const [quotaLimit, setQuotaLimit] = useState<number | null>(null);
  const [species, setSpecies] = useState("DOG");

  const sameSpecies = parents.filter((p) => p.species === species);
  const sires = sameSpecies.filter((p) => p.sex !== "FEMALE");
  const dams = sameSpecies.filter((p) => p.sex !== "MALE");

  function onSubmit(formData: FormData) {
    setError(null);
    setQuotaLimit(null);
    const photo = formData.get("photo") as File | null;
    const fe = {
      name: validateRequiredName(String(formData.get("name") || "")),
      breed: validateRequiredName(String(formData.get("breed") || ""), VErr.BREED_REQUIRED),
      color: validateRequiredName(String(formData.get("color") || ""), VErr.COLOR_REQUIRED),
      sex: validatePetSex(String(formData.get("sex") || "")),
      weightKg: validateWeightKg(String(formData.get("weightKg") || ""), true),
      photo: validatePetPhoto(photo),
    };
    const birthRaw = String(formData.get("birthDate") || "");
    const intakeRaw = String(formData.get("intakeAt") || "");
    const dateErrs = validatePetDates(birthRaw, intakeRaw);
    const merged = {
      ...fe,
      birthDate: dateErrs?.birth ?? dateErrs?.dates ?? null,
      intakeAt: dateErrs?.intake ?? dateErrs?.dates ?? null,
      dates: dateErrs?.dates ?? null,
    };
    setFieldErr(merged);
    if (Object.values(merged).some(Boolean)) return;
    startTransition(async () => {
      const res = await addPet(formData);
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
      if ("id" in res && res.id) router.push(`/app/pets/${res.id}`);
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
            <label className={labelCls}>{t.newPet.species} *</label>
            <select
              name="species"
              className={inputCls}
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
              <option value="DOG">{t.species.DOG}</option>
              <option value="CAT">{t.species.CAT}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.newPet.breed} *</label>
            <input name="breed" className={inputCls} placeholder={t.newPet.breedPlaceholder} />
            <FieldError code={fieldErr.breed} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.sex} *</label>
            <select name="sex" className={inputCls} defaultValue="">
              <option value="" disabled>
                {t.newPet.selectSex}
              </option>
              <option value="MALE">{t.sex.MALE}</option>
              <option value="FEMALE">{t.sex.FEMALE}</option>
            </select>
            <FieldError code={fieldErr.sex} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.color} *</label>
            <input name="color" className={inputCls} placeholder={t.newPet.colorPlaceholder} />
            <FieldError code={fieldErr.color} />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs text-muted">{t.newPet.datesHint}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t.newPet.birthDate}</label>
                <input name="birthDate" type="date" max={TODAY} className={inputCls} />
                <FieldError code={fieldErr.birthDate} />
              </div>
              <div>
                <label className={labelCls}>{t.newPet.intakeDate}</label>
                <input name="intakeAt" type="date" max={TODAY} className={inputCls} />
                <FieldError code={fieldErr.intakeAt} />
              </div>
            </div>
            <FieldError code={fieldErr.dates} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.weight} *</label>
            <input name="weightKg" type="number" step="0.1" min="0" max="200" className={inputCls} placeholder={t.newPet.weightPlaceholder} />
            <FieldError code={fieldErr.weightKg} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.photo} *</label>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-brand-700"
            />
            <FieldError code={fieldErr.photo} />
          </div>

          <div className="sm:col-span-2 mt-1 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t.newPet.lineage} <span className="font-normal normal-case">({t.common.optional})</span>
            </p>
          </div>
          <div>
            <label className={labelCls}>{t.newPet.sireFather}</label>
            <select name="sireId" className={inputCls} defaultValue="">
              <option value="">{t.common.none}</option>
              {sires.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.breed ? ` · ${p.breed}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.newPet.damMother}</label>
            <select name="damId" className={inputCls} defaultValue="">
              <option value="">{t.common.none}</option>
              {dams.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.breed ? ` · ${p.breed}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>
              {t.newPet.notes}{" "}
              <span className="font-normal normal-case">({t.common.optional})</span>
            </label>
            <textarea name="notes" rows={3} className={inputCls} placeholder={t.newPet.notesPlaceholder} />
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {quotaLimit !== null && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">{t.billing.quotaTitle}</p>
            <p className="mt-0.5 text-xs">{t.billing.quotaDesc(quotaLimit)}</p>
            <Link
              href="/app/billing"
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
