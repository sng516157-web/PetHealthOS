"use client";

import { Children, type ReactNode } from "react";
import { MotionPop, MotionReveal, motionCardHover } from "@/components/motion/aurora";

export { MotionPop, MotionReveal, motionCardHover };

/** Workspace page wrapper — flat paper background; motion is on cards, not ambient orbs. */
export function WorkspaceMotionShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full min-w-0 max-w-full overflow-x-clip bg-paper ps-min-h-workspace">
      {children}
    </div>
  );
}

/** Inner page padding for dashboard-style views (orbs come from layout shell). */
export function DashboardCanvas({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 max-w-full overflow-x-hidden py-8 lg:py-10 ${className}`}>
      {children}
    </div>
  );
}

/** Stagger entrance for sibling sections (cards, panels, form blocks). */
export function MotionStagger({
  children,
  className = "",
  step = 80,
  itemClassName = "",
  baseIndex = 0,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  itemClassName?: string;
  baseIndex?: number;
}) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <MotionPop
          key={i}
          index={baseIndex + i}
          stepMs={step}
          className={i > 0 ? itemClassName || "mt-5" : itemClassName}
        >
          {child}
        </MotionPop>
      ))}
    </div>
  );
}

/** Full-page stagger for account/billing-style stacked sections. */
export function MotionPage({
  children,
  step = 100,
}: {
  children: ReactNode;
  step?: number;
}) {
  return (
    <MotionStagger step={step} itemClassName="mt-6">
      {children}
    </MotionStagger>
  );
}

export function DashboardStatCard({
  icon,
  label,
  value,
  toneClass,
  delay,
  index = 0,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  toneClass: string;
  /** @deprecated use index — treated as index * 80ms */
  delay?: number;
  index?: number;
}) {
  const stepIndex = index ?? (delay !== undefined ? Math.round(delay / 80) : 0);
  return (
    <MotionPop index={stepIndex} stepMs={80}>
      <div
        className={`w-full min-w-0 max-w-full rounded-2xl border border-border bg-surface/90 p-5 shadow-soft backdrop-blur ${motionCardHover}`}
      >
        <div
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}
        >
          {icon}
        </div>
        <p className="mt-3 text-3xl font-bold text-forest">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </MotionPop>
  );
}
