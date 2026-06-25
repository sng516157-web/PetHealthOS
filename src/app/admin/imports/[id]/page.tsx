import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getI18n } from "@/lib/i18n/server";
import { LandingHeader } from "@/components/LandingHeader";
import { AdminLogin } from "@/components/AdminLogin";
import { passwordConfigured } from "@/lib/admin";
import { adminEmails } from "@/lib/email";
import { loadImportWorkspace } from "@/lib/data-import-workspace";
import { ImportWorkspace } from "@/components/admin/ImportWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminImportWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const admin = await isAdmin();

  if (!admin) {
    const canLogin = passwordConfigured();
    const configured = canLogin || adminEmails().length > 0;
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <LandingHeader t={t} />
        <main className="mx-auto w-full max-w-md flex-1 px-5 py-16">
          <div className="rounded-2xl border border-border bg-surface p-5">
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

  const workspace = await loadImportWorkspace(id);
  if ("error" in workspace) {
    if (workspace.error === "FORBIDDEN") redirect("/admin");
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} />
      <ImportWorkspace workspace={workspace} />
    </div>
  );
}
