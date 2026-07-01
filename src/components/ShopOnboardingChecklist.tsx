"use client";

import Link from "next/link";
import { Check, Circle, PawPrint, Syringe, Link2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import type { ShopOnboardingProgress } from "@/lib/shop-onboarding";

export function ShopOnboardingChecklist({
  progress,
}: {
  progress: ShopOnboardingProgress;
}) {
  const { t } = useI18n();
  if (progress.complete) return null;

  const steps = [
    {
      done: progress.hasPet,
      icon: PawPrint,
      label: t.onboarding.addPet,
      href: "/app/pets/new",
    },
    {
      done: progress.hasVaccineLog,
      icon: Syringe,
      label: t.onboarding.logVaccine,
      href: progress.hasPet ? "/app/pets" : "/app/pets/new",
    },
    {
      done: progress.hasPassport,
      icon: Link2,
      label: t.onboarding.issuePassport,
      href: progress.hasPet ? "/app/pets" : "/app/pets/new",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-forest">{t.onboarding.title}</h2>
        <span className="text-xs font-medium text-brand-700">
          {t.onboarding.progress(doneCount, steps.length)}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">{t.onboarding.subtitle}</p>
      <ol className="mt-4 space-y-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.label}>
              <Link
                href={step.href}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                  step.done
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                    : "border-border bg-white hover:border-brand-300"
                }`}
              >
                {step.done ? (
                  <Check size={18} className="shrink-0 text-emerald-600" />
                ) : (
                  <Circle size={18} className="shrink-0 text-muted" />
                )}
                <Icon size={16} className="shrink-0 text-muted" />
                <span className={step.done ? "line-through opacity-80" : "font-medium"}>
                  {step.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
