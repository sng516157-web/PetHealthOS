"use client";

import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import {
  buildPetTabModel,
  type PetLogSubTabId,
  type PetMainTabId,
  type PetTabModelOptions,
} from "@/components/pet-tab-model";

export function PetTabsInteractive({
  activeMain,
  activeLogSub,
  onMainChange,
  onLogSubChange,
  options = {},
  compact = false,
}: {
  activeMain: PetMainTabId;
  activeLogSub: PetLogSubTabId;
  onMainChange: (tab: PetMainTabId) => void;
  onLogSubChange: (tab: PetLogSubTabId) => void;
  options?: PetTabModelOptions;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const { mainTabs, logSubTabs } = buildPetTabModel(t.tabs, options);
  const onLogs = activeMain === "logs";

  const mainCls = compact
    ? "relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-2.5 py-2 text-[11px] font-medium transition-colors"
    : "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors";

  const subCls = compact
    ? "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition"
    : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition";

  const iconMain = compact ? 12 : 15;
  const iconSub = compact ? 11 : 13;

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 overflow-x-auto border-b border-border pb-px">
        {mainTabs.map((tab) => {
          const active = activeMain === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onMainChange(tab.id as PetMainTabId)}
              className={cn(
                mainCls,
                active ? "text-brand-700" : "text-slate-500 hover:text-foreground",
              )}
            >
              <Icon size={iconMain} className={active ? "text-brand-600" : "text-slate-400"} />
              {tab.label}
              {active && (
                <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-brand-600" />
              )}
            </button>
          );
        })}
      </div>

      {onLogs && (
        <div className="flex flex-wrap gap-1.5">
          {logSubTabs.map((tab) => {
            const active = activeLogSub === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onLogSubChange(tab.id as PetLogSubTabId)}
                className={cn(
                  subCls,
                  active
                    ? "bg-brand-600 text-white"
                    : "border border-border bg-surface text-slate-600 hover:border-brand-300",
                )}
              >
                <Icon size={iconSub} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
