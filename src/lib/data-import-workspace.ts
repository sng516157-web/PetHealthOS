import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { parseImportFileNames, parseImportFileRefs } from "@/lib/data-import-shared";
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
};

function mimeFromName(name: string): string {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "csv") return "text/csv";
  return "application/octet-stream";
}

function isPdfName(name: string): boolean {
  return name.toLowerCase().endsWith(".pdf");
}

function isCsvName(name: string): boolean {
  return name.toLowerCase().endsWith(".csv");
}

function mergeDocuments(
  fileNames: string[],
  saved: ImportDocumentState[],
): ImportDocumentState[] {
  const pdfs = fileNames
    .map((name, fileIndex) => ({ name, fileIndex }))
    .filter(({ name }) => isPdfName(name));

  return pdfs.map(({ name, fileIndex }) => {
    const prev = saved.find((d) => d.fileIndex === fileIndex);
    return (
      prev ?? {
        fileIndex,
        fileName: name,
        mimeType: mimeFromName(name),
        petId: null,
        kind: "OTHER" as AttachmentKind,
        label: name.replace(/\.pdf$/i, ""),
        status: "pending",
        attachmentId: null,
      }
    );
  });
}

export async function loadImportWorkspace(
  importId: string,
): Promise<ImportWorkspacePayload | { error: string }> {
  if (!(await isAdmin())) return { error: "FORBIDDEN" };

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

  const csvIndex = fileNames.findIndex(isCsvName);
  if (csvIndex >= 0 && fileRefs[csvIndex]) {
    const buf = await readPrivateDocBytes(fileRefs[csvIndex]);
    if (buf) {
      const text = buf.toString("utf-8").replace(/^\uFEFF/, "");
      const built = buildImportRowsFromCsv(text, {
        columnMapping: Object.keys(state.columnMapping).length ? state.columnMapping : undefined,
      });
      state.columnMapping = built.columnMapping;
      if (state.rows.length === 0) {
        state.rows = built.rows.map((r) => ({
          ...r,
          status: "pending",
          petId: null,
          skipReason: null,
        }));
      }
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
  };
}

export async function persistImportWorkspaceState(
  importId: string,
  state: DataImportProcessingState,
): Promise<{ ok: true } | { error: string }> {
  if (!(await isAdmin())) return { error: "FORBIDDEN" };
  const row = await prisma.dataImportRequest.findUnique({ where: { id: importId } });
  if (!row) return { error: "NOT_FOUND" };

  await prisma.dataImportRequest.update({
    where: { id: importId },
    data: { processingState: serializeProcessingState(state) },
  });
  return { ok: true };
}
