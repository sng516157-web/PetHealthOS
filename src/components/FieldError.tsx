"use client";

import { useI18n } from "@/lib/i18n/client";
import { validationMessage } from "@/lib/validation";

// Renders a localized inline validation message under a field. Accepts either a
// validation CODE (mapped via t.validation) or a raw fallback string, so it
// works for both client-side checks and legacy server error strings.
export function FieldError({
  code,
  className,
}: {
  code: string | null | undefined;
  className?: string;
}) {
  const { t } = useI18n();
  if (!code) return null;
  const dict = t.validation as unknown as Record<string, string>;
  return (
    <p className={`mt-1 text-xs text-alert ${className ?? ""}`}>
      {validationMessage(dict, code, code)}
    </p>
  );
}
