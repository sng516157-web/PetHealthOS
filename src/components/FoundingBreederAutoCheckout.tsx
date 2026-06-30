"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startFoundingBreederBestCheckout, clearFoundingIntent } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { trackBeginCheckout, trackFoundingLifetimeCtaClicked } from "@/lib/analytics";

export function FoundingBreederAutoCheckout() {
  const { t } = useI18n();
  const router = useRouter();
  const started = useRef(false);
  const [pending, start] = useTransition();
  const f = t.pricing.foundingLifetime;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    trackFoundingLifetimeCtaClicked("app_dashboard_auto");
    start(async () => {
      const fd = new FormData();
      fd.set("provider", "stripe");
      const res = await startFoundingBreederBestCheckout(fd);
      await clearFoundingIntent();
      if (res?.url) {
        trackBeginCheckout({
          accountType: "shop",
          product: "FOUNDING_BREEDER",
          valueUsd: 0,
        });
        window.location.href = res.url;
        return;
      }
      if (res?.ok) {
        router.replace("/app");
        router.refresh();
        return;
      }
      const q = res?.error ? `?foundingError=${encodeURIComponent(res.error)}` : "";
      router.replace(`/app${q}`);
      router.refresh();
    });
  }, [router, start]);

  return (
    <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm text-brand-900">
      {pending ? t.billing.redirecting : f.autoCheckoutBanner}
    </div>
  );
}
