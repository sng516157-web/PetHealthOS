import { redirect, notFound } from "next/navigation";
import { requireActiveOrg } from "@/lib/data";
import { loadImportWorkspace } from "@/lib/data-import-workspace";
import { ImportWorkspace } from "@/components/admin/ImportWorkspace";

export const dynamic = "force-dynamic";

export default async function AppImportReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireActiveOrg();

  const workspace = await loadImportWorkspace(id);
  if ("error" in workspace) {
    if (workspace.error === "FORBIDDEN") redirect("/app");
    notFound();
  }
  if (!workspace.orgId) redirect("/me/import/" + id);

  return (
    <div className="min-h-screen bg-paper">
      <ImportWorkspace workspace={workspace} mode="user" />
    </div>
  );
}
