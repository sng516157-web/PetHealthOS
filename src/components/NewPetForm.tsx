"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPet } from "@/app/actions";
import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";

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
  const [species, setSpecies] = useState("DOG");

  const sameSpecies = parents.filter((p) => p.species === species);
  const sires = sameSpecies.filter((p) => p.sex !== "FEMALE");
  const dams = sameSpecies.filter((p) => p.sex !== "MALE");

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await addPet(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.id) router.push(`/pets/${res.id}`);
    });
  }

  return (
    <Card className="p-6">
      <form action={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>{t.newPet.name} *</label>
            <input name="name" required className={inputCls} placeholder={t.newPet.namePlaceholder} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.species}</label>
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
            <input name="birthDate" type="date" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.newPet.weight}</label>
            <input name="weightKg" type="number" step="0.1" className={inputCls} placeholder={t.newPet.weightPlaceholder} />
          </div>
          <div>
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
            <label className={labelCls}>{t.newPet.notes}</label>
            <textarea name="notes" rows={3} className={inputCls} placeholder={t.newPet.notesPlaceholder} />
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

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
