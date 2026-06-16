"use client";

import type { ReactNode } from "react";
import { MotionStagger } from "./DashboardMotion";

export function PetOverviewGrid({
  main,
  sidebar,
}: {
  main: ReactNode[];
  sidebar: ReactNode[];
}) {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
      <MotionStagger className="min-w-0 space-y-5 lg:col-span-2" step={90} itemClassName="">
        {main.map((node, i) => (
          <div key={i}>{node}</div>
        ))}
      </MotionStagger>
      <MotionStagger className="min-w-0 space-y-5" step={90} itemClassName="">
        {sidebar.map((node, i) => (
          <div key={i}>{node}</div>
        ))}
      </MotionStagger>
    </div>
  );
}
