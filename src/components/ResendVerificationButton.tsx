"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { resendVerificationEmail } from "@/app/actions";

export function ResendVerificationButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function resend() {
    start(async () => {
      const res = await resendVerificationEmail();
      if (res?.devLink) {
        console.log("[email:dev] Verification link:", res.devLink);
        window.prompt("Dev mode — copy verification link:", res.devLink);
      }
      if (res?.error) {
        router.replace(`/verify-email?error=${res.error}`);
        return;
      }
      router.replace("/verify-email?sent=1");
    });
  }

  return (
    <button
      type="button"
      onClick={resend}
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      <RefreshCw size={15} className={pending ? "animate-spin" : ""} />
      {pending ? "…" : label}
    </button>
  );
}
