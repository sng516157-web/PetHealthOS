import type { Metadata } from "next";
import { ArrowLeft, Shield } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { getPrivacy } from "@/lib/legal-policies";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import { LegalDocumentView } from "@/components/LegalDocumentView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How PawSure collects, uses, and protects personal and pet health data — including AI features, payments, and facility access.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const { t, locale } = await getI18n();
  const doc = getPrivacy(locale);

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} locale={locale} />
      <LegalDocumentView
        doc={doc}
        icon={Shield}
        backLabel={
          <>
            <ArrowLeft size={14} /> {t.landing.backHome}
          </>
        }
      />
      <LandingFooter t={t} locale={locale} />
    </div>
  );
}
