"use client";

import { useState, useTransition } from "react";
import { Syringe } from "lucide-react";
import { applyVaccineTemplate, bulkLitterLog } from "@/app/actions";
import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import { validationMessage } from "@/lib/validation";

type Template = { id: string; name: string; species: string | null };

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "block text-xs font-medium text-muted mb-1.5";

export function BreederToolsPanel({
  templates,
  litters,
  selectedLitter,
}: {
  templates: Template[];
  litters: string[];
  selectedLitter?: string | null;
}) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  if (templates.length === 0 && !selectedLitter) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {templates.length > 0 && litters.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Syringe size={16} className="text-brand-600" />
            {t.vaccineTemplates.title}
          </div>
          <p className="mt-1 text-xs text-muted">{t.vaccineTemplates.desc}</p>
          <form
            className="mt-3 space-y-3"
            action={(fd) => {
              setError(null);
              setOk(null);
              startTransition(async () => {
                const res = await applyVaccineTemplate(fd);
                if (res?.error) {
                  setError(
                    validationMessage(
                      t.validation as unknown as Record<string, string>,
                      res.error,
                      res.error,
                    ),
                  );
                } else if (res?.count) {
                  setOk(t.vaccineTemplates.applied(res.count));
                }
              });
            }}
          >
            <div>
              <label className={labelCls}>{t.vaccineTemplates.template}</label>
              <select name="templateId" className={inputCls} required>
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                    {tmpl.species ? ` (${tmpl.species === "DOG" ? t.species.DOG : t.species.CAT})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.litter.applyTo}</label>
              <select name="target" className={inputCls} defaultValue={selectedLitter ? `litter:${selectedLitter}` : ""} required>
                <option value="" disabled>
                  {t.litter.selectTarget}
                </option>
                {litters.map((l) => (
                  <option key={l} value={`litter:${l}`}>
                    {t.litter.wholeLitter(l)}
                  </option>
                ))}
              </select>
            </div>
            {error && <FieldError code={error} />}
            {ok && <p className="text-sm text-emerald-700">{ok}</p>}
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? t.vaccineTemplates.applying : t.vaccineTemplates.apply}
            </button>
          </form>
        </Card>
      )}

      {selectedLitter && (
        <Card className="p-4">
          <div className="text-sm font-semibold text-foreground">{t.litter.bulkLogTitle}</div>
          <p className="mt-1 text-xs text-muted">{t.litter.bulkLogDesc(selectedLitter)}</p>
          <form
            className="mt-3 space-y-3"
            action={(fd) => {
              setError(null);
              setOk(null);
              fd.set("litterName", selectedLitter);
              startTransition(async () => {
                const res = await bulkLitterLog(fd);
                if (res?.error) {
                  setError(
                    validationMessage(
                      t.validation as unknown as Record<string, string>,
                      res.error,
                      res.error,
                    ),
                  );
                } else if (res?.count) {
                  setOk(t.litter.bulkLogged(res.count));
                }
              });
            }}
          >
            <div>
              <label className={labelCls}>{t.litter.logType}</label>
              <select name="type" className={inputCls} defaultValue="VACCINE">
                <option value="VACCINE">{t.litter.typeVaccine}</option>
                <option value="DEWORMING">{t.litter.typeDeworming}</option>
                <option value="OBSERVATION">{t.litter.typeObservation}</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.litter.logNote}</label>
              <textarea name="rawText" rows={2} className={inputCls} required placeholder={t.litter.logPlaceholder} />
            </div>
            {ok && <p className="text-sm text-emerald-700">{ok}</p>}
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? t.litter.logging : t.litter.bulkLog}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
