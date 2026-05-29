"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, RefreshCw } from "lucide-react";
import { generateTriageReport } from "@/app/actions";

export function GenerateTriageButton({
  petId,
  hasExisting,
}: {
  petId: string;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      await generateTriageReport(petId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={run}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? (
        <>
          <RefreshCw size={16} className="animate-spin" /> Assessing…
        </>
      ) : (
        <>
          <Stethoscope size={16} /> {hasExisting ? "Re-run triage" : "Generate triage"}
        </>
      )}
    </button>
  );
}
