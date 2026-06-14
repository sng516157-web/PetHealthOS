"use client";

import { Activity, ArrowRight, BellRing, PawPrint, Plus } from "lucide-react";
import { DemoDashboardChrome } from "./DemoDashboardChrome";
import { DemoWorkspaceShell } from "./DemoShells";
import { MOCK_SHOP } from "./mock-data";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

function StatCard({
  icon,
  label,
  value,
  tone,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
  delay: number;
}) {
  return (
    <MotionReveal delay={delay}>
      <div className={`rounded-2xl border border-border bg-surface p-5 shadow-soft ${motionCardHover}`}>
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </div>
        <p className="mt-3 text-3xl font-bold text-forest">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </MotionReveal>
  );
}

export function DemoShopDashboard() {
  const m = MOCK_SHOP;

  return (
    <div className="min-h-screen bg-paper">
      <DemoDashboardChrome active="shop" />
      <DemoWorkspaceShell orgName={m.orgName}>
        <div className="relative min-h-full overflow-hidden">
          <AuroraOrbs className="opacity-40" />
          <div className="relative w-full px-5 py-8 lg:px-10 lg:py-10">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <MotionPop index={0}>
                <p className="text-sm text-muted">{m.orgName}</p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-forest">
                  Overview
                </h1>
              </MotionPop>
              <MotionPop index={1}>
                <span className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-ps-button">
                  <Plus size={16} /> Add pet
                </span>
              </MotionPop>
            </header>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                delay={0}
                icon={<PawPrint size={18} />}
                label="Active pets"
                value={m.stats.pets}
                tone="bg-brand-50 text-brand-600"
              />
              <StatCard
                delay={80}
                icon={<Activity size={18} />}
                label="Needs attention"
                value={m.stats.attention}
                tone="bg-orange-50 text-orange-600"
              />
              <StatCard
                delay={160}
                icon={<BellRing size={18} />}
                label="Due this week"
                value={m.stats.dueWeek}
                tone="bg-amber-50 text-amber-600"
              />
              <StatCard
                delay={240}
                icon={<Activity size={18} />}
                label="Total log entries"
                value={m.stats.logs}
                tone="bg-sky-50 text-sky-600"
              />
            </div>

            <div className="mt-10 grid gap-8 xl:grid-cols-12">
              <div className="space-y-6 xl:col-span-8">
                <MotionReveal>
                  <h2 className="text-sm font-semibold text-forest">Needs attention</h2>
                  <p className="text-xs text-muted">Recent high-severity logs or under observation</p>
                </MotionReveal>
                <div className="space-y-3">
                  {m.attention.map((p, i) => (
                    <MotionReveal key={p.id} delay={i * 100}>
                      <div
                        className={`flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft ${motionCardHover}`}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-lg">
                          🐾
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-forest">{p.name}</p>
                          <p className="truncate text-sm text-muted">{p.note}</p>
                        </div>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          {p.severity}
                        </span>
                        <ArrowRight size={16} className="text-slate-300" />
                      </div>
                    </MotionReveal>
                  ))}
                </div>

                <MotionReveal delay={200}>
                  <h2 className="text-sm font-semibold text-forest">All pets</h2>
                </MotionReveal>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {m.pets.map((p, i) => (
                    <MotionReveal key={p.id} delay={240 + i * 60}>
                      <div
                        className={`flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft ${motionCardHover}`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper text-lg">
                          {p.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-forest">{p.name}</p>
                          <p className="truncate text-xs text-muted">{p.breed}</p>
                        </div>
                      </div>
                    </MotionReveal>
                  ))}
                </div>
              </div>

              <div className="xl:col-span-4">
                <MotionReveal delay={120}>
                  <div className="rounded-2xl border border-border bg-surface shadow-soft">
                    <div className="border-b border-border px-4 py-3">
                      <h2 className="text-sm font-semibold text-forest">Upcoming reminders</h2>
                    </div>
                    <ul className="divide-y divide-border">
                      {m.reminders.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-brand-50/30"
                        >
                          <span className="text-lg">📅</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {r.title}
                            </p>
                            <p className="truncate text-xs text-muted">{r.pet}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              r.overdue
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {r.when}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </MotionReveal>
              </div>
            </div>
          </div>
        </div>
      </DemoWorkspaceShell>
    </div>
  );
}
