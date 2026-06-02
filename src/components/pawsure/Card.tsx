import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-surface shadow-soft",
        interactive && "transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(36,89,76,0.14)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Compact pet row/tile with avatar, name, meta and a trailing slot.
export function PetCard({
  name,
  meta,
  avatar,
  trailing,
  onClick,
  className,
}: {
  name: string;
  meta?: string;
  avatar: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-3xl border border-border bg-surface p-3.5 text-left shadow-soft",
        onClick && "transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(36,89,76,0.14)]",
        className,
      )}
    >
      <span className="shrink-0">{avatar}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-forest">{name}</span>
        {meta && <span className="mt-0.5 block truncate text-xs text-muted">{meta}</span>}
      </span>
      {trailing ?? (onClick && <ChevronRight size={18} className="text-muted" />)}
    </Tag>
  );
}

// Larger profile header card (avatar + title + subtitle + actions).
export function ProfileCard({
  avatar,
  title,
  subtitle,
  badges,
  actions,
  className,
}: {
  avatar: React.ReactNode;
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-surface p-5 shadow-soft",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <span className="shrink-0">{avatar}</span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold text-forest">{title}</h3>
          {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
          {badges && <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>}
        </div>
      </div>
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
