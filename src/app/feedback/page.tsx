import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { FeedbackForm } from "@/components/FeedbackForm";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { AuroraOrbs, MotionPop, MotionReveal } from "@/components/motion/aurora";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return pageMetadata({
    title: t.feedback.metaTitle,
    description: t.feedback.metaDescription,
    path: "/feedback",
  });
}

export default async function FeedbackPage() {
  const { t, locale } = await getI18n();
  const user = await getCurrentUser();
  const f = t.feedback;

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} locale={locale} />

      <main className="relative overflow-hidden">
        <AuroraOrbs subtle className="-z-10 opacity-60" />
        <div className="relative mx-auto max-w-lg px-5 py-12 md:px-8">
          <MotionPop index={0}>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest"
            >
              <ArrowLeft size={14} /> {t.landing.backHome}
            </Link>
          </MotionPop>

          <MotionPop index={1}>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <MessageSquareText size={22} />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-forest">{f.title}</h1>
                <p className="text-xs text-muted">{f.subtitle}</p>
              </div>
            </div>
          </MotionPop>

          <MotionReveal delay={80}>
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <FeedbackForm
                initialEmail={user?.email ?? ""}
                initialName={user?.name ?? ""}
              />
            </div>
          </MotionReveal>
        </div>
      </main>

      <LandingFooter t={t} locale={locale} />
    </div>
  );
}
