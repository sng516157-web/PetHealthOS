"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

// Selectable filter chip.
export function Chip({
  children,
  selected = false,
  leftIcon,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  leftIcon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
        selected
          ? "bg-brand-600 text-white shadow-ps-button"
          : "bg-brand-500/10 text-forest hover:bg-brand-500/20",
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}

export type StatusTone =
  | "success"
  | "info"
  | "warn"
  | "alert"
  | "neutral"
  | "gold";

const STATUS: Record<StatusTone, string> = {
  success: "bg-brand-500/12 text-brand-800 ring-brand-500/25",
  info: "bg-blue/15 text-[#326b76] ring-blue/40",
  warn: "bg-gold/20 text-[#8a6a1f] ring-gold/50",
  alert: "bg-alert/12 text-[#b4503b] ring-alert/30",
  neutral: "bg-sand/40 text-ink/70 ring-border",
  gold: "bg-gold/20 text-[#8a6a1f] ring-gold/50",
};

const DOT: Record<StatusTone, string> = {
  success: "bg-brand-500",
  info: "bg-blue",
  warn: "bg-gold",
  alert: "bg-alert",
  neutral: "bg-ink/40",
  gold: "bg-gold",
};

export function StatusBadge({
  children,
  tone = "neutral",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset",
        STATUS[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])} />}
      {children}
    </span>
  );
}
