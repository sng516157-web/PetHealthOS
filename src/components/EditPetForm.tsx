"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePet } from "@/app/actions";
import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import {
  validateRequiredName,
  validateWeightKg,
  validatePetDates,
  validatePetSex,
  validationMessage,
  VErr,
} from "@/lib/validation";
import type { ParentOption } from "@/components/NewPetForm";

const TODAY = new Date().toISOString().slice(0, 10);

const inputCls =
  "box-border min-w-0 w-full max-w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "block text-xs font-medium text-muted mb-1.5";

export type PetProfileInitial = {
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  color: string | null;
  birthDate: string | null;
  intakeAt: string | null;
  weightKg: number | null;
  notes: string | null;
  litterName?: string | null;
  sireId?: string | null;
  damId?: string | null;
};

function dateInputValue(d: string | null): string {
  if (!d) return "";
  return d.slice(0, 10);
}

export function EditPetForm({
  petId,
  initial,
  variant,
  parents = [],
  returnHref,
}: {
  petId: string;
  initial: PetProfileInitial;
  variant: "shop" | "owner";
  parents?: ParentOption[];
  returnHref: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [species, setSpecies] = useState(initial.species);
  const [fieldErr, setFieldErr] = useState<{
    name?: string | null;
    breed?: string | null;
    color?: string | null;
    sex?: string | null;
    birthDate?: string | null;
    intakeAt?: string | null;
    dates?: string | null;
    weightKg?: string | null;
  }>({});

  const sameSpecies = parents.filter((p) => p.species === species);
  const sires = sameSpecies.filter((p) => p.sex !== "FEMALE");
  const dams = sameSpecies.filter((p) => p.sex !== "MALE");

  function onSubmit(formData: FormData) {
    setError(null);
    const fe = {
      name: validateRequiredName(String(formData.get("name") || "")),
      breed: validateRequiredName(String(formData.get("breed") || ""), VErr.BREED_REQUIRED),
      color: validateRequiredName(String(formData.get("color") || ""), VErr.COLOR_REQUIRED),
      sex: validatePetSex(String(formData.get("sex") || "")),
      weightKg: validateWeightKg(String(formData.get("weightKg") || ""), true),
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
      const res = await updatePet(petId, formData);
      if (res && "error" in res && res.error) {
        setError(
          validationMessage(
            t.validation as unknown as Record<string, string>,
            res.error,
            res.error,
          ),
        );
        return;
      }
      router.push(returnHref);
      router.refresh();
    });
  }

  return (
    <Card className="min-w-0 overflow-hidden p-4 sm:p-6">
      <form action={onSubmit} noValidate className="min-w-0 space-y-5">
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <div className="sm:col-span-2">
            <label className={labelCls}>{t.newPet.name} *</label>
            <input
              name="name"
              className={inputCls}
              defaultValue={initial.name}
              placeholder={t.newPet.namePlaceholder}
            />
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
            <input
              name="breed"
              className={inputCls}
              defaultValue={initial.breed ?? ""}
              placeholder={t.newPet.breedPlaceholder}
            />
            <FieldError code={fieldErr.breed} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.sex} *</label>
            <select name="sex" className={inputCls} defaultValue={initial.sex ?? ""}>
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
            <input
              name="color"
              className={inputCls}
              defaultValue={initial.color ?? ""}
              placeholder={t.newPet.colorPlaceholder}
            />
            <FieldError code={fieldErr.color} />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs text-muted">{t.newPet.datesHint}</p>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
              <div>
                <label className={labelCls}>{t.newPet.birthDate}</label>
                <input
                  name="birthDate"
                  type="date"
                  max={TODAY}
                  className={inputCls}
                  defaultValue={dateInputValue(initial.birthDate)}
                />
                <FieldError code={fieldErr.birthDate} />
              </div>
              <div>
                <label className={labelCls}>{t.newPet.intakeDate}</label>
                <input
                  name="intakeAt"
                  type="date"
                  max={TODAY}
                  className={inputCls}
                  defaultValue={dateInputValue(initial.intakeAt)}
                />
                <FieldError code={fieldErr.intakeAt} />
              </div>
            </div>
            <FieldError code={fieldErr.dates} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.weight} *</label>
            <input
              name="weightKg"
              type="number"
              step="0.1"
              min="0"
              max="200"
              className={inputCls}
              defaultValue={initial.weightKg ?? ""}
              placeholder={t.newPet.weightPlaceholder}
            />
            <FieldError code={fieldErr.weightKg} />
          </div>

          {variant === "shop" && (
            <>
              <div className="sm:col-span-2 mt-1 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t.newPet.lineage}{" "}
                  <span className="font-normal normal-case">({t.common.optional})</span>
                </p>
              </div>
              <div>
                <label className={labelCls}>{t.newPet.sireFather}</label>
                <select name="sireId" className={inputCls} defaultValue={initial.sireId ?? ""}>
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
                <select name="damId" className={inputCls} defaultValue={initial.damId ?? ""}>
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
                  {t.litter.fieldLabel}{" "}
                  <span className="font-normal normal-case">({t.common.optional})</span>
                </label>
                <input
                  name="litterName"
                  className={inputCls}
                  defaultValue={initial.litterName ?? ""}
                  placeholder={t.litter.fieldPlaceholder}
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label className={labelCls}>
              {t.newPet.notes}{" "}
              <span className="font-normal normal-case">({t.common.optional})</span>
            </label>
            <textarea
              name="notes"
              rows={3}
              className={inputCls}
              defaultValue={initial.notes ?? ""}
              placeholder={t.newPet.notesPlaceholder}
            />
          </div>
        </div>

        <p className="text-xs text-muted">{t.editPet.photoHint}</p>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => router.push(returnHref)}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:w-auto"
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
          >
            {pending ? t.editPet.saving : t.editPet.save}
          </button>
        </div>
      </form>
    </Card>
  );
}
