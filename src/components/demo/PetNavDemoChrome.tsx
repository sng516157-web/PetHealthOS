"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PetNavDemoTabs } from "@/components/demo/PetNavDemoTabs";
import { DEMO_PET_HEADER } from "@/components/demo/pet-log-demo-data";

export function PetNavDemoChrome({
  children,
  showCheckin = true,
  variant = "owner",
}: {
  children: React.ReactNode;
  showCheckin?: boolean;
  variant?: "owner" | "shop";
}) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-forest"
          >
            <ArrowLeft size={16} /> Demo hub
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-sage">
            Pet nav preview · not integrated
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
            🐕
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-forest">{DEMO_PET_HEADER.name}</h1>
            <p className="text-sm text-muted">
              {DEMO_PET_HEADER.breed} · {DEMO_PET_HEADER.ageLabel}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <PetNavDemoTabs showCheckin={showCheckin} variant={variant} />
        </div>

        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </div>
  );
}
