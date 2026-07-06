"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import { buildPetTabModel, petTabHref } from "@/components/pet-tab-model";

export function PetTabs({
  petId,
  base = `/app/pets/${petId}`,
  includeTransfer = false,
  includeCheckin = false,
  includeAI = true,
  includeTriage = true,
}: {
  petId: string;
  base?: string;
  includeTransfer?: boolean;
  includeCheckin?: boolean;
  includeAI?: boolean;
  includeTriage?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const logPaths = [base, `${base}/health`, `${base}/food`, `${base}/activity`, `${base}/medication`];
  const onLogSection = logPaths.includes(pathname);

  const { mainTabs, logSubTabs } = buildPetTabModel(t.tabs, {
    includeTransfer,
    includeCheckin,
    includeAI,
    includeTriage,
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto ps-scroll-x border-b border-border pb-px">
        {mainTabs.map((tab) => {
          const href =
            tab.id === "logs"
              ? base
              : petTabHref(base, tab.id as Parameters<typeof petTabHref>[1]);
          const active =
            tab.id === "logs"
              ? onLogSection
              : pathname === href || pathname.startsWith(`${href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
                active ? "text-brand-700" : "text-slate-500 hover:text-foreground",
              )}
            >
              <Icon size={15} className={active ? "text-brand-600" : "text-slate-400"} />
              {tab.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </div>

      {onLogSection && (
        <div className="flex flex-wrap gap-1.5">
          {logSubTabs.map((tab) => {
            const href = petTabHref(
              base,
              "logs",
              tab.id as "quick" | "health" | "food" | "activity" | "medication",
            );
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "border border-border bg-surface text-slate-600 hover:border-brand-300",
                )}
              >
                <Icon size={13} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
