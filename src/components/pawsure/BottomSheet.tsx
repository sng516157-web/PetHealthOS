"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  useBodyScrollLock(open);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-lg max-h-[min(92dvh,calc(100vh-2rem))] overflow-y-auto rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(36,89,76,0.18)] animate-sheet-up sm:rounded-3xl sm:shadow-[0_24px_60px_rgba(36,89,76,0.22)]",
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-sand sm:hidden" />
        {title && <h2 className="text-lg font-extrabold text-forest">{title}</h2>}
        <div className={cn(title && "mt-3")}>{children}</div>
      </div>
    </div>
  );
}
