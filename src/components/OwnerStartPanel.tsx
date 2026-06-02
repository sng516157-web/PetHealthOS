"use client";

import { useState } from "react";
import { UserPlus, QrCode } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { AuthCard } from "@/components/AuthCard";
import { PassportScanner } from "@/components/PassportScanner";

type Mode = "fresh" | "scan";

export function OwnerStartPanel() {
  const { t } = useI18n();
  const o = t.landing.owner;
  const [mode, setMode] = useState<Mode>("fresh");

  const options: { id: Mode; icon: React.ReactNode; title: string; desc: string }[] = [
    { id: "fresh", icon: <UserPlus size={18} />, title: o.freshTitle, desc: o.freshDesc },
    { id: "scan", icon: <QrCode size={18} />, title: o.scanTitle, desc: o.scanDesc },
  ];

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-brand-400 bg-brand-50/50 ring-2 ring-brand-100"
                  : "border-border bg-paper hover:border-brand-300"
              }`}
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  active ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
                }`}
              >
                {opt.icon}
              </span>
              <span className="mt-3 text-sm font-bold text-forest">{opt.title}</span>
              <span className="mt-1 text-xs leading-relaxed text-ink/65">{opt.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {mode === "fresh" ? (
          <AuthCard accountType="owner" defaultTab="register" />
        ) : (
          <div className="rounded-2xl border border-border bg-paper p-5">
            <h3 className="text-sm font-bold text-forest">{t.landing.scan.title}</h3>
            <p className="mb-4 mt-1 text-xs text-muted">{t.landing.scan.desc}</p>
            <PassportScanner />
          </div>
        )}
      </div>
    </div>
  );
}
