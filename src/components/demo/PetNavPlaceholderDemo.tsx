"use client";

import { Sparkles, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import { useI18n } from "@/lib/i18n/client";

export function PetNavPlaceholderDemo({ kind }: { kind: "chat" | "triage" }) {
  const { t } = useI18n();
  const isChat = kind === "chat";
  const Icon = isChat ? Sparkles : Stethoscope;

  return (
    <PetNavDemoChrome>
      <Card className="border-dashed p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon size={22} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-forest">
          {isChat ? t.tabs.aiAssistant : t.tabs.triage}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          {t.demoNav.placeholderBody}
        </p>
      </Card>
    </PetNavDemoChrome>
  );
}
