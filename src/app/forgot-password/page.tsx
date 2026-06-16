import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { LocaleToggle } from "@/components/LocaleToggle";
import { getI18n } from "@/lib/i18n/server";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = privateRobots;

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");

  const { t } = await getI18n();
  const params = await searchParams;
  const sent = params.sent === "1";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="mb-6 flex w-full max-w-sm items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <PawSureMarkTile className="h-9 w-9" />
          <span className="text-sm font-extrabold text-forest">PawSure</span>
        </Link>
        <LocaleToggle compact />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <div className="mb-2 flex justify-center text-brand-600">
          <Mail size={28} strokeWidth={1.75} />
        </div>
        <h1 className="text-center text-lg font-bold text-forest">
          {sent ? t.forgotPassword.sentTitle : t.forgotPassword.title}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          {sent ? t.forgotPassword.sentDesc : t.forgotPassword.desc}
        </p>
        {sent ? (
          <div className="mt-6 space-y-3">
            <Link
              href="/reset-password"
              className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {t.forgotPassword.enterCode}
            </Link>
            <Link
              href="/login"
              className="block text-center text-xs text-muted underline hover:text-forest"
            >
              {t.forgotPassword.backToSignIn}
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <ForgotPasswordForm />
          </div>
        )}
        {!sent && (
          <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
            {t.forgotPassword.hint}
          </p>
        )}
      </div>
    </div>
  );
}
