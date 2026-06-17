"use client";

import { useState } from "react";
import { Sparkles, Stethoscope } from "lucide-react";
import { OrgChatPanel } from "@/components/OrgChatPanel";
import { OrgWardTriagePanel } from "@/components/OrgWardTriagePanel";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import type { OrgWardTriageResult } from "@/lib/ai";

type Tab = "assistant" | "ward";

export function OrgAiWorkspace({
  facility,
  petCount,
  aiEnabled,
  preview = false,
  previewReport,
}: {
  facility: boolean;
  petCount: number;
  aiEnabled: boolean;
  preview?: boolean;
  previewReport?: OrgWardTriageResult;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("assistant");

  return (
    <div
      className={cn(preview ? "space-y-4 py-2" : "space-y-6 py-6 md:py-8")}
    >
      <header>
        <h1
          className={cn(
            "font-extrabold tracking-tight text-forest",
            preview ? "text-lg" : "text-2xl sm:text-3xl",
          )}
        >
          {t.orgAi.pageTitle}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {t.orgAi.pageSubtitle(facility, petCount)}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "assistant" as const, label: t.orgAi.tabAssistant, icon: Sparkles },
            { id: "ward" as const, label: t.orgAi.tabWard, icon: Stethoscope },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === id
                ? "bg-brand-600 text-white shadow-ps-button"
                : "border border-border bg-surface text-slate-600 hover:border-brand-300",
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "assistant" ? (
        <OrgChatPanel
          aiEnabled={aiEnabled}
          facility={facility}
          petCount={petCount}
          preview={preview}
        />
      ) : (
        <OrgWardTriagePanel
          aiEnabled={aiEnabled}
          preview={preview}
          previewReport={previewReport}
        />
      )}
    </div>
  );
}
