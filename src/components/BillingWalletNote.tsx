"use client";

import { useI18n } from "@/lib/i18n/client";

export function BillingWalletNote() {
  const { t } = useI18n();
  return (
    <p className="mt-2 text-center text-[11px] leading-relaxed text-muted">
      {t.billing.walletsComingSoon}
    </p>
  );
}
