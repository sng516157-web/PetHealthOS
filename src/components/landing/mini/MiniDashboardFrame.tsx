"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

export function MiniDashboardFrame({
  urlLabel,
  hint,
  children,
  className,
}: {
  urlLabel: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_50px_rgba(36,89,76,0.12)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-slate-100/90 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden />
        <span className="ml-1 truncate rounded-md bg-white/80 px-2 py-0.5 font-mono text-[10px] text-muted">
          {urlLabel}
        </span>
        {hint && (
          <span className="ml-auto hidden text-[10px] font-medium text-brand-700 sm:inline">{hint}</span>
        )}
      </div>
      <div className="aspect-video w-full overflow-hidden bg-paper">
        <div className="h-full overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

export function MiniBackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-3 inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-brand-700"
    >
      <ChevronLeft size={14} /> {label}
    </button>
  );
}

export function MiniPetHeader({ pet }: { pet: { emoji: string; name: string; breed: string } }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-xl">
        {pet.emoji}
      </span>
      <div>
        <h2 className="text-lg font-extrabold text-forest">{pet.name}</h2>
        <p className="text-[11px] text-muted">{pet.breed}</p>
      </div>
    </div>
  );
}
