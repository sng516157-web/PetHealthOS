"use client";

import { Send } from "lucide-react";
import { Card } from "@/components/ui";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import { useI18n } from "@/lib/i18n/client";

/** Shop / facility tab bar — no check-in, includes Transfer. */
export function PetNavShopPreview() {
  const { t } = useI18n();

  return (
    <PetNavDemoChrome showCheckin={false} variant="shop">
      <Card className="border-dashed p-6 text-sm text-muted">
        <p>
          Shop and facility accounts use the same tab layout except <strong>Check-in</strong> is
          replaced by <strong>Transfer</strong> (shops only). Open any tab above to preview owner
          content — tab labels match all account types.
        </p>
      </Card>
      <Card className="p-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Send size={22} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-forest">{t.tabs.transfer}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t.demoNav.placeholderBody}</p>
      </Card>
    </PetNavDemoChrome>
  );
}
