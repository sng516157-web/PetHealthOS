"use client";

import type { ReactNode } from "react";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

export { MotionPop, MotionReveal, motionCardHover };

export function DashboardCanvas({
  children,
  orbClassName = "opacity-40",
}: {
  children: ReactNode;
  orbClassName?: string;
}) {
  return (
    <div className="relative min-h-full overflow-hidden">
      <AuroraOrbs className={orbClassName} />
      <div className="relative mx-auto w-full max-w-[1600px] px-5 py-8 lg:px-10 lg:py-10">
        {children}
      </div>
    </div>
  );
}

export function DashboardStatCard({
  icon,
  label,
  value,
  toneClass,
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  toneClass: string;
  delay?: number;
}) {
  return (
    <MotionReveal delay={delay}>
      <div
        className={`rounded-2xl border border-border bg-surface/90 p-5 shadow-soft backdrop-blur ${motionCardHover}`}
      >
        <div
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}
        >
          {icon}
        </div>
        <p className="mt-3 text-3xl font-bold text-forest">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </MotionReveal>
  );
}
