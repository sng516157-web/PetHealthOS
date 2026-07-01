"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { MotionPop } from "./dashboard/DashboardMotion";

export function OrgAiPromoCard({
  facility,
  petCount,
  preview,
  className,
}: {
  facility: boolean;
  petCount: number;
  preview?: { onOpen: () => void };
  className?: string;
}) {
  const { t } = useI18n();
  const body = (
    <Card className="flex flex-col gap-4 border-brand-200 bg-gradient-to-br from-brand-50/80 via-surface to-sand/20 p-4 shadow-soft transition sm:flex-row sm:items-center sm:justify-between sm:p-5 group-hover:border-brand-300 group-hover:shadow-[0_8px_24px_rgba(36,89,76,0.08)]">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
          <Sparkles size={12} /> {t.orgAi.promoBadge}
        </div>
        <h2 className="mt-2 text-base font-bold text-forest">
          {facility ? t.orgAi.promoTitleFacility : t.orgAi.promoTitleShop}
        </h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          {t.orgAi.promoDesc(facility, petCount)}
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-ps-button transition group-hover:bg-brand-700">
        {t.orgAi.promoCta} <ArrowRight size={15} />
      </span>
    </Card>
  );

  return (
    <MotionPop index={2} className={className}>
      {preview ? (
        <button
          type="button"
          onClick={preview.onOpen}
          className="group block w-full text-left"
        >
          {body}
        </button>
      ) : (
        <Link href="/app/ai" className="group block w-full">
          {body}
        </Link>
      )}
    </MotionPop>
  );
}
