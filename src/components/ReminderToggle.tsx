"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toggleReminder } from "@/app/actions";

export function ReminderToggle({
  id,
  completed,
}: {
  id: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleReminder(id);
          router.refresh();
        })
      }
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
        completed
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-slate-300 text-transparent hover:border-brand-500 hover:text-brand-500"
      }`}
      aria-label={completed ? "Mark not done" : "Mark done"}
    >
      <Check size={13} />
    </button>
  );
}
