import * as React from "react";
import { cn } from "@/lib/cn";

// Warm welcome / step card used in onboarding flows. Optional step dots show
// progress; `art` is a slot for the illustrative mark.
export function OnboardingCard({
  art,
  eyebrow,
  title,
  description,
  steps,
  currentStep,
  actions,
  className,
}: {
  art?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  steps?: number;
  currentStep?: number;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[28px] border border-border bg-surface shadow-soft",
        className,
      )}
    >
      <div className="flex items-center justify-center bg-gradient-to-b from-brand-500/15 to-sand/30 px-6 py-10">
        {art}
      </div>
      <div className="px-6 py-6 text-center">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-xl font-extrabold text-forest">{title}</h2>
        {description && (
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}

        {steps && steps > 1 && (
          <div className="mt-5 flex justify-center gap-1.5">
            {Array.from({ length: steps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === (currentStep ?? 0)
                    ? "w-6 bg-brand-600"
                    : "w-1.5 bg-sand",
                )}
              />
            ))}
          </div>
        )}

        {actions && <div className="mt-6 flex flex-col gap-2">{actions}</div>}
      </div>
    </div>
  );
}
