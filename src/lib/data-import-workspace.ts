import { prisma } from "@/lib/prisma";
import { assertCanManageImport } from "@/lib/data-import-access";
import {
  isCsvFileName,
  isImportDocFileName,
  mimeFromImportFileName,
  parseImportFileNames,
  parseImportFileRefs,
} from "@/lib/data-import-shared";
import { readPrivateDocBytes } from "@/lib/private-doc";
import { buildImportRowsFromCsv } from "@/lib/data-import-csv";
import {
  type DataImportProcessingState,
  type ImportDocumentState,
  emptyProcessingState,
  parseProcessingState,
  serializeProcessingState,
} from "@/lib/data-import-plan";
import type { AttachmentKind } from "@/lib/constants";

export type ImportWorkspacePet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
};

export type ImportWorkspacePayload = {
  id: string;
  status: string;
  submitterName: string;
  submitterEmail: string | null;
  orgId: string | null;
  orgName: string | null;
  userId: string;
  accountType: "shop" | "owner";
  note: string | null;
  submittedAt: string;
  fileNames: string[];
  state: DataImportProcessingState;
  existingPets: ImportWorkspacePet[];
  asAdmin: boolean;
};

function heuristicDocKind(fileName: string): AttachmentKind {
  const n = fileName.toLowerCase();
  if (/vacc|疫苗|免疫/.test(n)) return "VACCINE_CERT";
  if (/pedigree|血统|系谱|registration/.test(n)) return "PEDIGREE";
  if (/lab|血检|检测|titer|抗体/.test(n)) return "LAB_RESULT";
  if (/\.(jpg|jpeg|png|webp)$/i.test(n)) return "PHOTO";
  return "OTHER";
}

function mergeDocuments(
  fileNames: string[],
  saved: ImportDocumentState[],
): ImportDocumentState[] {
  const docs = fileNames
    .map((name, fileIndex) => ({ name, fileIndex }))
    .filter(({ name }) => isImportDocFileName(name));

  return docs.map(({ name, fileIndex }) => {
    const prev = saved.find((d) => d.fileIndex === fileIndex);
    return (
      prev ?? {
        fileIndex,
        fileName: name,
        mimeType: mimeFromImportFileName(name),
        petId: null,
        kind: heuristicDocKind(name),
        label: name.replace(/\.[^.]+$/i, ""),
        status: "pending",
        attachmentId: null,
      }
    );
  });
}

export async function loadImportWorkspace(
  importId: string,
): Promise<ImportWorkspacePayload | { error: string }> {
  const access = await assertCanManageImport(importId);
  if ("error" in access) return access;

  const row = await prisma.dataImportRequest.findUnique({
    where: { id: importId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, orgId: true } },
      org: { select: { id: true, name: true } },
    },
  });
  if (!row) return { error: "NOT_FOUND" };

  const fileNames = parseImportFileNames(row.fileNames);
  const fileRefs = parseImportFileRefs(row.fileRefs);
  const saved = parseProcessingState(row.processingState);

  let state = saved ?? emptyProcessingState();

  const csvIndex = fileNames.findIndex(isCsvFileName);
  if (csvIndex >= 0 && fileRefs[csvIndex] && state.rows.length === 0) {
    const buf = await readPrivateDocBytes(fileRefs[csvIndex]);
    if (buf) {
      const text = buf.toString("utf-8").replace(/^\uFEFF/, "");
      const built = buildImportRowsFromCsv(text, {
        columnMapping: Object.keys(state.columnMapping).length
          ? state.columnMapping
          : undefined,
      });
      state.columnMapping = built.columnMapping;
      state.rows = built.rows.map((r) => ({
        ...r,
        status: "pending",
        petId: null,
        skipReason: null,
      }));
    }
  }

  state.documents = mergeDocuments(fileNames, state.documents);

  const existingPets: ImportWorkspacePet[] = row.orgId
    ? await prisma.pet.findMany({
        where: { orgId: row.orgId, status: { in: ["ACTIVE", "UNDER_OBSERVATION"] } },
        select: { id: true, name: true, species: true, breed: true },
        orderBy: { name: "asc" },
      })
    : await prisma.pet.findMany({
        where: { ownerUserId: row.userId, status: { not: "DECEASED" } },
        select: { id: true, name: true, species: true, breed: true },
        orderBy: { name: "asc" },
      });

  if (!saved && state.rows.length > 0) {
    await prisma.dataImportRequest.update({
      where: { id: importId },
      data: { processingState: serializeProcessingState(state) },
    });
  }

  return {
    id: row.id,
    status: row.status,
    submitterName: row.user.name,
    submitterEmail: row.user.email ?? row.user.phone,
    orgId: row.orgId,
    orgName: row.org?.name ?? null,
    userId: row.userId,
    accountType: row.orgId ? "shop" : "owner",
    note: row.note,
    submittedAt: row.submittedAt.toISOString(),
    fileNames,
    state,
    existingPets,
    asAdmin: access.asAdmin,
  };
}

export async function persistImportWorkspaceState(
  importId: string,
  state: DataImportProcessingState,
): Promise<{ ok: true } | { error: string }> {
  const access = await assertCanManageImport(importId);
  if ("error" in access) return access;

  await prisma.dataImportRequest.update({
    where: { id: importId },
    data: { processingState: serializeProcessingState(state) },
  });
  return { ok: true };
}
