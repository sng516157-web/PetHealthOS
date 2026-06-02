"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type TabItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

export function BottomTabBar({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange?: (key: string) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-paper/90 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-md",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            onClick={() => onChange?.(item.key)}
            className="group flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5"
          >
            <span
              className={cn(
                "flex h-9 w-12 items-center justify-center rounded-full transition",
                isActive ? "bg-brand-600 text-white shadow-ps-button" : "text-muted",
              )}
            >
              {item.icon}
            </span>
            <span
              className={cn(
                "text-[11px] font-bold transition",
                isActive ? "text-forest" : "text-muted",
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
