"use client";

import Link from "next/link";
import { FieldError } from "@/components/FieldError";
import type { Dictionary } from "@/lib/i18n/en";

export function LegalAcceptField({
  t,
  error,
}: {
  t: Dictionary;
  error?: string | null;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-paper/80 px-3 py-2.5">
        <input
          type="checkbox"
          name="acceptLegal"
          value="1"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-brand-600 focus:ring-brand-500"
        />
        <span className="text-[11px] leading-relaxed text-ink/75">
          {t.auth.legalAcceptPrefix}{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-semibold text-brand-700 underline hover:text-forest"
          >
            {t.landing.termsOfService}
          </Link>{" "}
          {t.auth.legalAcceptJoin}{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="font-semibold text-brand-700 underline hover:text-forest"
          >
            {t.landing.privacyPolicy}
          </Link>
          .
        </span>
      </label>
      <FieldError code={error} />
    </div>
  );
}

export function isLegalAccepted(formData: FormData): boolean {
  return String(formData.get("acceptLegal") || "") === "1";
}
