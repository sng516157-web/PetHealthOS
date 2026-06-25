import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdmin, passwordConfigured } from "@/lib/admin";
import { adminEmails } from "@/lib/email";
import { adminLogout } from "@/app/actions";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";
import { getTimezone } from "@/lib/timezone/server";
import { LandingHeader } from "@/components/LandingHeader";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminReviewItem, type AdminOrg } from "@/components/AdminReviewItem";
import { AdminDeathClaimItem, type AdminDeathClaim } from "@/components/AdminDeathClaimItem";
import { AdminDocs } from "@/components/AdminDocs";
import { AdminGrantPanel } from "@/components/AdminGrantPanel";
import {
  AdminUnverifiedItem,
  type AdminUnverifiedUser,
} from "@/components/AdminUnverifiedItem";
import { AdminDataImportItem, type AdminDataImport } from "@/components/AdminDataImportItem";
import { listUnverifiedSignups } from "@/lib/email-verify";
import { readAllDocs } from "@/lib/docs";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { t, locale } = await getI18n();
  const timeZone = await getTimezone();
  const fmt = { timeZone, locale };
  const admin = await isAdmin();

  if (!admin) {
    const canLogin = passwordConfigured();
    const configured = canLogin || adminEmails().length > 0;
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <LandingHeader t={t} />
        <main className="mx-auto w-full max-w-md flex-1 px-5 py-16">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-forest">{t.admin.loginTitle}</h1>
              <p className="text-sm text-muted">{t.admin.loginDesc}</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
            {configured && canLogin ? (
              <AdminLogin />
            ) : (
              <p className="text-sm text-muted">{t.admin.notConfigured}</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  const orgs = await prisma.organization.findMany({
    where: { verificationStatus: { in: ["PENDING", "APPROVED", "REJECTED"] } },
    orderBy: [{ verificationSubmittedAt: "desc" }],
  });

  const toAdminOrg = (o: (typeof orgs)[number]): AdminOrg => ({
    id: o.id,
    name: o.name,
    kind: o.kind,
    status: o.verificationStatus,
    docType: o.verificationDocType,
    note: o.verificationNote,
    reviewNote: o.reviewNote,
    submittedAt: o.verificationSubmittedAt
      ? formatDate(o.verificationSubmittedAt, fmt)
      : null,
    hasDoc: Boolean(o.verificationDocUrl),
  });

  const pending = orgs.filter((o) => o.verificationStatus === "PENDING");
  const reviewed = orgs.filter((o) => o.verificationStatus !== "PENDING");

  const deathClaimsRaw = await prisma.petDeathClaim.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      pet: { select: { id: true, name: true } },
      user: { select: { name: true } },
    },
  });
  const pendingClaims = deathClaimsRaw.filter((c) => c.status === "PENDING");
  const reviewedClaims = deathClaimsRaw.filter((c) => c.status !== "PENDING");

  const toDeathClaim = (c: (typeof deathClaimsRaw)[number]): AdminDeathClaim => ({
    id: c.id,
    petId: c.pet.id,
    petName: c.pet.name,
    ownerName: c.user.name,
    status: c.status,
    proofDocUrls: c.proofDocUrls,
    applicantNote: c.applicantNote,
    reviewNote: c.reviewNote,
    submittedAt: c.submittedAt ? formatDate(c.submittedAt, fmt) : null,
  });

  const docs = await readAllDocs();

  const unverifiedRaw = await listUnverifiedSignups(50);
  const unverified: AdminUnverifiedUser[] = unverifiedRaw.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: formatDate(u.createdAt, fmt),
    accountLabel: !u.orgId
      ? t.admin.unverifiedOwner
      : u.org?.kind === "HOSPITAL" || u.org?.kind === "BOARDING"
        ? t.admin.unverifiedFacility
        : t.admin.unverifiedShop,
    emailsSent: u._count.emailVerifications,
  }));

  const importRowsRaw = await prisma.dataImportRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { submittedAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true, orgId: true } },
      org: { select: { name: true } },
    },
  });
  const pendingImports: AdminDataImport[] = importRowsRaw.map((row) => ({
    id: row.id,
    status: row.status,
    accountLabel: row.orgId ? t.admin.unverifiedShop : t.admin.unverifiedOwner,
    submitterName: row.user.name,
    submitterEmail: row.user.email ?? row.user.phone,
    orgName: row.org?.name ?? null,
    fileNames: row.fileNames,
    note: row.note,
    submittedAt: formatDate(row.submittedAt, fmt),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <LandingHeader t={t} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 md:px-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-forest">{t.admin.title}</h1>
            <p className="text-sm text-muted">{t.admin.subtitle}</p>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
            >
              {t.admin.signOut}
            </button>
          </form>
        </div>

        <h2 className="mt-8 text-sm font-semibold text-forest">
          {t.admin.pendingTab} ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
            {t.admin.empty}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((o) => (
              <AdminReviewItem key={o.id} org={toAdminOrg(o)} />
            ))}
          </div>
        )}

        {reviewed.length > 0 && (
          <>
            <h2 className="mt-10 text-sm font-semibold text-forest">
              {t.admin.allTab}
            </h2>
            <div className="mt-3 space-y-3">
              {reviewed.map((o) => (
                <AdminReviewItem key={o.id} org={toAdminOrg(o)} />
              ))}
            </div>
          </>
        )}

        <h2 className="mt-10 text-sm font-semibold text-forest">
          {t.admin.deathClaimTitle} ({pendingClaims.length})
        </h2>
        <p className="mt-1 text-xs text-muted">{t.admin.deathClaimDesc}</p>
        {pendingClaims.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
            {t.admin.deathClaimEmpty}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {pendingClaims.map((c) => (
              <AdminDeathClaimItem key={c.id} claim={toDeathClaim(c)} />
            ))}
          </div>
        )}

        {reviewedClaims.length > 0 && (
          <>
            <h2 className="mt-10 text-sm font-semibold text-forest">
              {t.admin.deathClaimTitle} — {t.admin.allTab}
            </h2>
            <div className="mt-3 space-y-3">
              {reviewedClaims.map((c) => (
                <AdminDeathClaimItem key={c.id} claim={toDeathClaim(c)} />
              ))}
            </div>
          </>
        )}

        <h2 className="mt-10 text-sm font-semibold text-forest">
          {t.admin.unverifiedTitle} ({unverified.length})
        </h2>
        <p className="mt-1 text-xs text-muted">{t.admin.unverifiedDesc}</p>
        {unverified.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
            {t.admin.unverifiedEmpty}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {unverified.map((u) => (
              <AdminUnverifiedItem key={u.id} user={u} />
            ))}
          </div>
        )}

        <AdminGrantPanel />

        <h2 className="mt-10 text-sm font-semibold text-forest">
          {t.admin.dataImportTitle} ({pendingImports.length})
        </h2>
        <p className="mt-1 text-xs text-muted">{t.admin.dataImportDesc}</p>
        {pendingImports.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
            {t.admin.dataImportEmpty}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {pendingImports.map((row) => (
              <AdminDataImportItem key={row.id} row={row} />
            ))}
          </div>
        )}

        <hr className="my-10 border-border" />
        <AdminDocs docs={docs} />
      </main>
    </div>
  );
}
