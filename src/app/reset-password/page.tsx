import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { validatePasswordResetToken } from "@/lib/password-reset";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { LocaleToggle } from "@/components/LocaleToggle";
import { getI18n } from "@/lib/i18n/server";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = privateRobots;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");

  const { t } = await getI18n();
  const params = await searchParams;
  const token = params.token?.trim();
  let tokenInvalid = false;
  if (token) {
    const check = await validatePasswordResetToken(token);
    tokenInvalid = "error" in check;
  }

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
          <KeyRound size={28} strokeWidth={1.75} />
        </div>
        <h1 className="text-center text-lg font-bold text-forest">{t.resetPassword.title}</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          {token && !tokenInvalid ? t.resetPassword.descLink : t.resetPassword.descCode}
        </p>
        <div className="mt-6">
          <ResetPasswordForm token={token} tokenInvalid={token ? tokenInvalid : false} />
        </div>
      </div>
    </div>
  );
}
