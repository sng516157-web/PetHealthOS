"use client";

import { useCallback, useState } from "react";
import { User, Store, Hospital } from "lucide-react";
import { cn } from "@/lib/cn";
import { SectionHeading } from "@/components/landing/LandingBlocks";
import { MotionReveal } from "@/components/motion/aurora";
import { MiniDashboardFrame } from "./mini/MiniDashboardFrame";
import { DashboardPreviewRole } from "@/components/dashboard/preview/DashboardPreviewRole";
import type { landingEn } from "@/lib/i18n/landing-en";

type Role = "owner" | "shop" | "facility";

const ROLES: { id: Role; label: string; icon: typeof User }[] = [
  { id: "owner", label: "Pet owners", icon: User },
  { id: "shop", label: "Shops & breeders", icon: Store },
  { id: "facility", label: "Clinics & boarding", icon: Hospital },
];

export function LandingMiniDashboards({
  copy,
}: {
  copy: Pick<
    typeof landingEn,
    "showcaseEyebrow" | "showcaseTitle" | "showcaseSubtitle" | "showcaseScreens" | "showcaseInteractiveHint"
  >;
}) {
  const [role, setRole] = useState<Role>("owner");
  const [url, setUrl] = useState("pethealthos.online/me");

  const onUrlChange = useCallback((next: string) => {
    setUrl(next);
  }, []);

  const screenCopy = copy.showcaseScreens[role === "owner" ? 0 : role === "shop" ? 1 : 2];

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <MotionReveal>
        <SectionHeading
          eyebrow={copy.showcaseEyebrow}
          title={copy.showcaseTitle}
          subtitle={copy.showcaseSubtitle}
        />
      </MotionReveal>

      <MotionReveal delay={60} className="mt-8 flex flex-wrap justify-center gap-2">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const active = role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setRole(r.id);
                setUrl(r.id === "owner" ? "pethealthos.online/me" : "pethealthos.online/app");
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-brand-600 text-white shadow-ps-button"
                  : "border border-border bg-surface text-slate-600 hover:border-brand-300",
              )}
            >
              <Icon size={15} /> {r.label}
            </button>
          );
        })}
      </MotionReveal>

      <MotionReveal delay={100} className="mt-6">
        <p className="text-center text-sm text-muted">{copy.showcaseInteractiveHint}</p>
      </MotionReveal>

      <MotionReveal delay={120} className="mt-8 grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <MiniDashboardFrame urlLabel={url} hint="Interactive demo">
            <DashboardPreviewRole role={role} onUrlChange={onUrlChange} />
          </MiniDashboardFrame>
        </div>
        <div className="flex flex-col justify-center lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-sage">
            {screenCopy?.role}
          </span>
          <h3 className="mt-2 text-xl font-extrabold text-forest">{screenCopy?.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">{screenCopy?.desc}</p>
          <ul className="mt-4 space-y-2">
            {screenCopy?.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-ink/75">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </MotionReveal>
    </section>
  );
}
