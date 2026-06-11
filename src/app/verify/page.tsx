import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Clock, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { getActiveOrg } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";
import { getTimezone } from "@/lib/timezone/server";
import { LandingHeader } from "@/components/LandingHeader";
import { VerifyForm } from "@/components/VerifyForm";
import { signOut } from "@/app/actions";

export default async function VerifyPage() {
  const org = await getActiveOrg();
  // Only shop accounts have a verification flow. Owners / logged-out users go
  // to the shop landing.
  if (!org) redirect("/shop");
  const { t, locale } = await getI18n();
  const timeZone = await getTimezone();
  const fmt = { timeZone, locale };

  const status = org.verificationStatus;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <LandingHeader t={t} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-forest">{t.verify.title}</h1>
            <p className="text-sm text-muted">{org.name}</p>
          </div>
          <form action={signOut} className="ml-auto">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
            >
              <LogOut size={13} /> {t.auth.signOut}
            </button>
          </form>
        </div>

        {status === "APPROVED" ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={18} /> {t.verify.approvedTitle}
            </div>
            <p className="mt-1 text-sm text-slate-600">{t.verify.approvedDesc}</p>
            <Link
              href="/app"
              className="mt-4 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t.verify.goToApp}
            </Link>
          </div>
        ) : status === "PENDING" ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <Clock size={18} /> {t.verify.pendingTitle}
            </div>
            <p className="mt-1 text-sm text-slate-600">{t.verify.pendingDesc}</p>
            {org.verificationSubmittedAt && (
              <p className="mt-2 text-xs text-muted">
                {t.verify.pendingSince(formatDate(org.verificationSubmittedAt, fmt))}
              </p>
            )}
            <Link
              href="/app"
              className="mt-4 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t.verify.goToApp}
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-600">{t.verify.subtitle}</p>
            <div className="mt-3 rounded-xl bg-calm/10 px-4 py-3 text-xs text-slate-600">
              {t.verify.why}
            </div>

            {status === "REJECTED" && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                  <XCircle size={18} /> {t.verify.rejectedTitle}
                </div>
                <p className="mt-1 text-sm text-slate-600">{t.verify.rejectedDesc}</p>
                {org.reviewNote && (
                  <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-700">
                    <span className="font-medium">{t.verify.reviewerNote}: </span>
                    {org.reviewNote}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
              <VerifyForm />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
