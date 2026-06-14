"use client";

import {
  ArrowRight,
  Bell,
  PawPrint,
  Plus,
  QrCode,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { DemoDashboardChrome } from "./DemoDashboardChrome";
import { DemoOwnerHeader } from "./DemoShells";
import { MOCK_OWNER } from "./mock-data";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  UNDER_OBSERVATION: "bg-amber-50 text-amber-800",
};

export function DemoOwnerDashboard() {
  const m = MOCK_OWNER;

  return (
    <div className="min-h-screen bg-paper">
      <DemoDashboardChrome active="owner" />
      <DemoOwnerHeader />

      <div className="relative overflow-hidden">
        <AuroraOrbs className="opacity-50" />
        <div className="relative mx-auto max-w-[1600px] px-5 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <MotionPop index={0}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/90 px-3 py-1 text-xs font-medium text-forest">
                <Sparkles size={13} /> Your pets at a glance
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-forest lg:text-4xl">
                Hi, {m.name}
              </h1>
              <p className="mt-1 text-sm text-muted">
                Lifelong health records — calm, clear, always with you.
              </p>
            </MotionPop>
            <MotionPop index={1}>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-ps-button">
                  <Plus size={16} /> Add pet
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-forest">
                  <UserCircle size={16} /> Account
                </span>
              </div>
            </MotionPop>
          </div>

          <MotionReveal delay={80} className="mt-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Pets", value: m.pets.length, icon: PawPrint },
                { label: "Alerts", value: m.notifications.length, icon: Bell },
                { label: "Passports", value: 1, icon: QrCode },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl border border-border bg-surface/90 p-4 shadow-soft backdrop-blur ${motionCardHover}`}
                >
                  <s.icon size={18} className="text-brand-600" />
                  <p className="mt-2 text-2xl font-bold text-forest">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </MotionReveal>

          <div className="mt-10 grid gap-8 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <MotionReveal>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-forest">Your pets</h2>
                  <span className="text-xs font-medium text-brand-700">View all</span>
                </div>
              </MotionReveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {m.pets.map((pet, i) => (
                  <MotionReveal key={pet.id} delay={i * 90}>
                    <div
                      className={`flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-soft ${motionCardHover}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl">
                          {pet.species === "DOG" ? "🐕" : "🐈"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-forest">{pet.name}</p>
                          <p className="truncate text-xs text-muted">
                            {pet.breed} · {pet.age}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASS[pet.status]}`}
                      >
                        {pet.status.replace("_", " ")}
                      </span>
                    </div>
                  </MotionReveal>
                ))}
              </div>
            </div>

            <div className="space-y-4 xl:col-span-4">
              <MotionReveal delay={120}>
                <div
                  className={`rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-surface p-5 shadow-soft ${motionCardHover}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                      <QrCode size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-forest">Scan a passport</p>
                      <p className="text-xs text-muted">Inherit history from your breeder</p>
                    </div>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    Open scanner <ArrowRight size={14} />
                  </span>
                </div>
              </MotionReveal>

              <MotionReveal delay={180}>
                <div className="rounded-2xl border border-border bg-surface shadow-soft">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold text-forest">Notifications</h2>
                  </div>
                  <ul className="divide-y divide-border">
                    {m.notifications.map((n) => (
                      <li key={n.id} className="px-4 py-3 transition hover:bg-brand-50/40">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted">{n.pet}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </MotionReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
