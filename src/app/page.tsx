import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { PassportHomepageLanding } from "@/components/landing/PassportHomepageLanding";
import { pageMetadata } from "@/lib/seo";
import { getFoundingBreederLifetimeAvailability } from "@/lib/founding-breeder-lifetime";

export const metadata: Metadata = pageMetadata({
  title: "Digital Pet Health Passports",
  description:
    "Pet health records and QR passports — owners scan at handover; breeders, shelters, and shops build the record before transfer.",
  path: "/",
});

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");
  const [{ locale, t }, founding] = await Promise.all([
    getI18n(),
    getFoundingBreederLifetimeAvailability(),
  ]);

  return (
    <PassportHomepageLanding
      locale={locale}
      t={t}
      founding={founding.soldOut ? null : founding}
    />
  );
}
