"use client";

import { toDatetimeLocalValue } from "@/lib/log-time";
import { useI18n } from "@/lib/i18n/client";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function LogOccurredAtField({ defaultValue }: { defaultValue?: string }) {
  const { t } = useI18n();
  return (
    <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
      {t.logCommon.dateTime}
      <input
        type="datetime-local"
        name="occurredAt"
        defaultValue={defaultValue ?? toDatetimeLocalValue()}
        className={`${inputCls} mt-1`}
      />
    </label>
  );
}

export { inputCls as logFormInputCls };
