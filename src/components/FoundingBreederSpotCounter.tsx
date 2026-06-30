"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import type { FoundingSpotAvailability } from "@/lib/founding-breeder-lifetime";

type Props = {
  initial: FoundingSpotAvailability;
  className?: string;
  onSoldOut?: () => void;
};

const POLL_MS = 30_000;

export function FoundingBreederSpotCounter({ initial, className, onSoldOut }: Props) {
  const { t } = useI18n();
  const f = t.pricing.foundingEarly;
  const [availability, setAvailability] = useState(initial);

  useEffect(() => {
    if (availability.soldOut) return;

    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/founding-breeder-lifetime/availability");
        if (!res.ok || cancelled) return;
        const next = (await res.json()) as { early: FoundingSpotAvailability };
        if (cancelled) return;
        setAvailability(next.early);
        if (next.early.soldOut) onSoldOut?.();
      } catch {
        /* ignore transient network errors */
      }
    }

    const id = window.setInterval(refresh, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [availability.soldOut, onSoldOut]);

  if (availability.soldOut) return null;

  const { remaining, limit, claimed } = availability;
  const claimedPct = Math.min(100, Math.round((claimed / Math.max(1, limit)) * 100));

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700/80">
            {f.spotsLabel}
          </p>
          <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-brand-800">
            {remaining}
            <span className="ml-1 text-sm font-semibold text-muted">/ {limit}</span>
          </p>
        </div>
        <p className="pb-0.5 text-right text-xs font-medium text-brand-700">
          {f.spotsRemaining(remaining)}
        </p>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100"
        role="progressbar"
        aria-valuenow={claimed}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={f.spotsClaimed(claimed, limit)}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-500"
          style={{ width: `${claimedPct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-muted">{f.spotsClaimed(claimed, limit)}</p>
    </div>
  );
}
