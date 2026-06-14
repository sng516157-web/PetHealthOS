import type { Metadata } from "next";
import { ArrowLeft, FileText } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { getTerms } from "@/lib/legal-policies";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import { LegalDocumentView } from "@/components/LegalDocumentView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "Terms governing use of PawSure pet health records, passports, and workspace accounts for owners, shops, and facilities.",
  path: "/terms",
});

export default async function TermsPage() {
  const { t, locale } = await getI18n();
  const doc = getTerms(locale);

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} locale={locale} />
      <LegalDocumentView
        doc={doc}
        icon={FileText}
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
