import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";

export type DataImportManageContext = {
  importId: string;
  orgId: string | null;
  userId: string;
  asAdmin: boolean;
  fileRefs: string;
  processingState: string | null;
  status: string;
};

/** Admin or the submitting user (same org / owner account). */
export async function assertCanManageImport(
  importId: string,
): Promise<DataImportManageContext | { error: string }> {
  const row = await prisma.dataImportRequest.findUnique({
    where: { id: importId },
    select: {
      id: true,
      orgId: true,
      userId: true,
      fileRefs: true,
      processingState: true,
      status: true,
    },
  });
  if (!row) return { error: "NOT_FOUND" };

  if (await isAdmin()) {
    return {
      importId: row.id,
      orgId: row.orgId,
      userId: row.userId,
      asAdmin: true,
      fileRefs: row.fileRefs,
      processingState: row.processingState,
      status: row.status,
    };
  }

  const user = await getCurrentUser();
  if (!user || user.id !== row.userId) return { error: "FORBIDDEN" };
  if (row.orgId) {
    if (user.orgId !== row.orgId) return { error: "FORBIDDEN" };
  } else if (user.orgId) {
    return { error: "FORBIDDEN" };
  }

  return {
    importId: row.id,
    orgId: row.orgId,
    userId: row.userId,
    asAdmin: false,
    fileRefs: row.fileRefs,
    processingState: row.processingState,
    status: row.status,
  };
}
