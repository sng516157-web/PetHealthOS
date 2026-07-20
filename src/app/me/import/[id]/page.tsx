import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loadImportWorkspace } from "@/lib/data-import-workspace";
import { ImportWorkspace } from "@/components/admin/ImportWorkspace";

export const dynamic = "force-dynamic";

export default async function MeImportReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.orgId) redirect(`/app/import/${id}`);

  const workspace = await loadImportWorkspace(id);
  if ("error" in workspace) {
    if (workspace.error === "FORBIDDEN") redirect("/me");
    notFound();
  }
  if (workspace.orgId) redirect(`/app/import/${id}`);

  return (
    <div className="min-h-screen bg-paper">
      <ImportWorkspace workspace={workspace} mode="user" />
    </div>
  );
}
