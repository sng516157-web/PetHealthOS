import { prisma } from "@/lib/prisma";
import { DATA_IMPORT_ACTIVE_STATUSES } from "@/lib/data-import-status";

export {
  DATA_IMPORT_MAX_FILE_BYTES,
  DATA_IMPORT_MAX_PDFS,
  DATA_IMPORT_MAX_DOCS,
  parseImportFileNames,
  parseImportFileRefs,
} from "@/lib/data-import-shared";

export async function getPendingDataImport(opts: {
  userId: string;
  orgId: string | null;
}) {
  return prisma.dataImportRequest.findFirst({
    where: {
      userId: opts.userId,
      orgId: opts.orgId,
      status: { in: [...DATA_IMPORT_ACTIVE_STATUSES] },
    },
    orderBy: { submittedAt: "desc" },
    select: { id: true, submittedAt: true, status: true },
  });
}
