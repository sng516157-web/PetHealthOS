import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { PassportHomepageLanding } from "@/components/landing/PassportHomepageLanding";
import { pageMetadata, privateRobots } from "@/lib/seo";
import { getFoundingBreederLifetimeAvailability } from "@/lib/founding-breeder-lifetime";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Homepage preview archive — QR health passports",
    description:
      "Archive of the passport-first homepage — now live at /. Breeders, shelters, pet shops, and owners.",
    path: "/demo/homepage-v2",
  }),
  ...privateRobots,
};

export default async function HomepageV2PreviewPage() {
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
      previewBanner
      founding={founding.soldOut ? null : founding}
    />
  );
}
