"use client";

import { ArrowRight, QrCode, Sparkles } from "lucide-react";
import { DemoDashboardChrome } from "./DemoDashboardChrome";
import { DemoWorkspaceShell } from "./DemoShells";
import { MOCK_FACILITY } from "./mock-data";
import {
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

export function DemoFacilityDashboard() {
  const m = MOCK_FACILITY;
  const capacity = 50;
  const inCare = m.inCare.length;

  return (
    <div className="min-h-screen bg-paper">
      <DemoDashboardChrome active="facility" />
      <DemoWorkspaceShell orgName={m.orgName}>
        <div className="relative w-full px-5 py-8 lg:px-10 lg:py-10">
            <MotionPop index={0}>
              <div className="flex flex-wrap items-end justify-between gap-6 rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50/90 via-surface to-sand/30 p-6 shadow-soft lg:p-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
                    <Sparkles size={13} /> In your care
                  </span>
                  <h1 className="mt-3 text-3xl font-extrabold text-forest">{m.orgName}</h1>
                  <p className="mt-1 max-w-lg text-sm text-muted">
                    Scan an owner&apos;s QR to admit a pet, log during the stay, and archive on
                    take-back.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-ps-button">
                  <QrCode size={18} /> Admit pet
                </span>
              </div>
            </MotionPop>

            <MotionReveal delay={100} className="mt-6">
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-soft">
                <div>
                  <p className="text-2xl font-bold text-forest">
                    {inCare}{" "}
                    <span className="text-base font-normal text-muted">/ {capacity} slots</span>
                  </p>
                  <p className="text-xs text-muted">Pets currently in care</p>
                </div>
                <div className="h-2 min-w-[200px] flex-1 overflow-hidden rounded-full bg-brand-100">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-700"
                    style={{ width: `${(inCare / capacity) * 100}%` }}
                  />
                </div>
              </div>
            </MotionReveal>

            <MotionReveal delay={160} className="mt-8">
              <h2 className="text-sm font-semibold text-forest">Active stays</h2>
            </MotionReveal>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {m.inCare.map((pet, i) => (
                <MotionReveal key={pet.id} delay={200 + i * 80}>
                  <div
                    className={`flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft ${motionCardHover}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl">
                        🏥
                      </div>
                      <div>
                        <p className="font-semibold text-forest">{pet.name}</p>
                        <p className="text-xs text-muted">{pet.breed}</p>
                      </div>
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">{pet.last}</p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-muted">{pet.logs} logs this stay</span>
                      <span className="inline-flex items-center gap-0.5 font-semibold text-brand-700">
                        Open <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </MotionReveal>
              ))}
            </div>

            <MotionReveal delay={400} className="mt-8">
              <span className="text-sm font-medium text-brand-700">View archived stays →</span>
            </MotionReveal>
          </div>
      </DemoWorkspaceShell>
    </div>
  );
}
