import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { needsEmailVerification } from "@/lib/email-verify";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { getI18n } from "@/lib/i18n/server";
import { ResendVerificationButton } from "@/components/ResendVerificationButton";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!needsEmailVerification(user)) {
    redirect(user.orgId ? "/app" : "/me");
  }

  const { t } = await getI18n();
  const params = await searchParams;
  const errKey = params.error;
  const justSent = params.sent === "1";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6 flex justify-center">
          <PawSureMarkTile className="h-12 w-12" />
        </div>
        <div className="mb-2 flex justify-center text-brand-600">
          <Mail size={28} strokeWidth={1.75} />
        </div>
        <h1 className="text-center text-lg font-bold text-forest">
          {t.verifyEmail.title}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          {t.verifyEmail.desc(user.email ?? "")}
        </p>
        {justSent && (
          <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-center text-xs text-brand-800">
            {t.verifyEmail.sentAgain}
          </p>
        )}
        {errKey && (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs text-rose-700">
            {t.verifyEmail.errors[errKey as keyof typeof t.verifyEmail.errors] ??
              t.verifyEmail.errors.TOKEN_INVALID}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <ResendVerificationButton label={t.verifyEmail.resend} />
          <Link
            href="/"
            className="text-center text-xs text-muted underline hover:text-forest"
          >
            {t.verifyEmail.backHome}
          </Link>
        </div>
        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
          {t.verifyEmail.hint}
        </p>
      </div>
    </div>
  );
}
