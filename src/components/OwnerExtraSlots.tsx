"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Plus } from "lucide-react";
import { addOwnerPetSlot } from "@/app/actions";
import { BillingWalletNote } from "@/components/BillingWalletNote";
import { useI18n } from "@/lib/i18n/client";
import { trackBeginCheckout } from "@/lib/analytics";

export function OwnerExtraSlots({
  includedPets,
  extraPetPriceUsd,
  petCap,
  extraSlots,
}: {
  includedPets: number;
  extraPetPriceUsd: number;
  petCap: number;
  extraSlots: number;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const purchased = includedPets + extraSlots;
  const atCap = purchased >= petCap;

  function mapError(code: string): string {
    if (code === "CAP_REACHED") return t.billing.slotCapReached(petCap);
    if (
      code === "PROVIDER_NOT_CONFIGURED" ||
      code === "PROVIDER_NOT_IMPLEMENTED" ||
      code === "STRIPE_NOT_CONFIGURED"
    ) {
      return t.billing.providerComingSoon;
    }
    return code;
  }

  function buy() {
    setError(null);
    setNotice(null);
    setBusy("stripe");
    start(async () => {
      const fd = new FormData();
      fd.set("provider", "stripe");
      const res = await addOwnerPetSlot(fd);
      setBusy(null);
      if (res?.url) {
        trackBeginCheckout({
          accountType: "owner",
          product: "owner_extra_pet_slot",
          valueUsd: extraPetPriceUsd,
        });
        setNotice(t.billing.redirecting);
        window.location.href = res.url;
        return;
      }
      if (res?.error) {
        setError(mapError(res.error));
        return;
      }
      if (res?.ok) {
        if (res.demo) setNotice(t.billing.slotAdded);
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <PawPrint size={16} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-foreground">
          {t.billing.extraPetsTitle}
        </h3>
      </div>
      <p className="mt-1 text-xs text-muted">
        {t.billing.extraPetsDesc(includedPets, extraPetPriceUsd, petCap)}
      </p>
      <p className="mt-3 text-sm text-foreground">
        {t.billing.slotsOwned(purchased, petCap)}
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {atCap ? (
        <p className="mt-3 text-xs font-medium text-amber-700">
          {t.billing.slotCapReached(petCap)}
        </p>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => buy()}
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <Plus size={13} />
            {busy === "stripe"
              ? "…"
              : t.billing.addPetSlot(extraPetPriceUsd)}
          </button>
          <BillingWalletNote />
        </div>
      )}
    </div>
  );
}
