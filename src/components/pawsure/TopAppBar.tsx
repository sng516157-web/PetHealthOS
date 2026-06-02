import * as React from "react";
import { cn } from "@/lib/cn";

export function TopAppBar({
  leading,
  title,
  subtitle,
  actions,
  className,
}: {
  leading?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-paper/85 px-4 py-3 backdrop-blur-md",
        className,
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        {typeof title === "string" ? (
          <h1 className="truncate text-base font-extrabold text-forest">{title}</h1>
        ) : (
          title
        )}
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </header>
  );
}
