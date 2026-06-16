"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui";
import { LogTimeline } from "@/components/LogTimeline";
import { QuickAddLog } from "@/components/QuickAddLog";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import { INITIAL_HEALTH } from "@/components/demo/pet-log-demo-data";

/** Health log tab — uses real QuickAddLog UI in demo mode (no server save). */
export function PetLogHealthDemo() {
  const [logs] = useState(INITIAL_HEALTH);

  return (
    <PetNavDemoChrome>
      <Card className="border-dashed border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900">
        <span className="inline-flex items-center gap-2 font-medium">
          <AlertTriangle size={16} /> Demo mode
        </span>
        <p className="mt-1 text-xs text-amber-800/90">
          <strong>Quick Log</strong> sub-tab — natural-language notes with AI structuring. Edit/delete on
          timeline entries shown below. Saving will not persist in this demo.
        </p>
      </Card>

      <div className="pointer-events-none opacity-60">
        <QuickAddLog petId="demo" ownerConfirm />
      </div>
      <p className="-mt-4 text-center text-xs text-muted">↑ Quick-add disabled in demo (preview layout only)</p>

      <LogTimeline petId="demo" logs={logs} canEdit canDelete />
    </PetNavDemoChrome>
  );
}
