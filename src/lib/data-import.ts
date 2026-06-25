import { prisma } from "@/lib/prisma";

export {
  DATA_IMPORT_MAX_FILE_BYTES,
  DATA_IMPORT_MAX_PDFS,
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
      status: "PENDING",
    },
    orderBy: { submittedAt: "desc" },
    select: { id: true, submittedAt: true },
  });
}
