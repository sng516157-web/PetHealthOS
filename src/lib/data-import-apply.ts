import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { assertCanManageImport } from "@/lib/data-import-access";
import { assignShopPetSlot } from "@/lib/org-slots";
import { parseImportFileRefs } from "@/lib/data-import-shared";
import { publishPrivateDocBytes } from "@/lib/private-doc";
import {
  type DataImportProcessingState,
  type ImportPetMapped,
  parseProcessingState,
  serializeProcessingState,
} from "@/lib/data-import-plan";
import type { AttachmentKind } from "@/lib/constants";

function actionId(): string {
  return randomBytes(6).toString("hex");
}

async function loadImportRow(importId: string) {
  const access = await assertCanManageImport(importId);
  if ("error" in access) return access;

  const state = parseProcessingState(access.processingState);
  if (!state) return { error: "NOT_FOUND" as const };

  return {
    row: {
      id: access.importId,
      orgId: access.orgId,
      userId: access.userId,
      fileRefs: access.fileRefs,
    },
    state,
  };
}

async function saveState(importId: string, state: DataImportProcessingState) {
  await prisma.dataImportRequest.update({
    where: { id: importId },
    data: { processingState: serializeProcessingState(state) },
  });
}

function petCreateData(
  mapped: ImportPetMapped,
  orgId: string | null,
  userId: string,
): { data: Parameters<typeof prisma.pet.create>[0]["data"] } | { error: string } {
  const birthDate = mapped.birthDate ? new Date(mapped.birthDate) : null;
  const intakeAt = mapped.intakeAt ? new Date(mapped.intakeAt) : null;
  if (!birthDate && !intakeAt) {
    return { error: "DATE_REQUIRED" };
  }

  return {
    data: {
      name: mapped.name.trim(),
      species: mapped.species,
      sex: mapped.sex,
      breed: mapped.breed.trim(),
      color: mapped.color.trim(),
      birthDate,
      intakeAt,
      weightKg: mapped.weightKg,
      microchip: mapped.microchip?.trim() || null,
      notes: mapped.notes?.trim() || null,
      orgId,
      ownerUserId: orgId ? null : userId,
      status: "ACTIVE",
    },
  };
}

export async function applyImportRowPet(
  importId: string,
  rowId: string,
  options?: { includeLogs?: boolean; includeWeight?: boolean },
): Promise<{ petId: string } | { error: string }> {
  const loaded = await loadImportRow(importId);
  if ("error" in loaded) return loaded;

  const { row, state } = loaded;
  const idx = state.rows.findIndex((r) => r.rowId === rowId);
  if (idx < 0) return { error: "ROW_NOT_FOUND" };
  const importRow = state.rows[idx];
  if (importRow.status === "applied" && importRow.petId) {
    return { petId: importRow.petId };
  }

  const built = petCreateData(importRow.mapped, row.orgId, row.userId);
  if ("error" in built) return { error: built.error };

  const pet = await prisma.pet.create({ data: built.data });
  if (row.orgId) await assignShopPetSlot(row.orgId, pet.id);

  const at = new Date().toISOString();
  state.applied.push({
    id: actionId(),
    at,
    kind: "pet",
    summary: `Created pet ${pet.name}`,
    entityId: pet.id,
    rowId,
  });

  if (options?.includeWeight !== false && importRow.mapped.weightKg > 0) {
    const measuredAt = importRow.mapped.birthDate
      ? new Date(importRow.mapped.birthDate)
      : importRow.mapped.intakeAt
        ? new Date(importRow.mapped.intakeAt)
        : new Date();
    await prisma.weightEntry.create({
      data: {
        petId: pet.id,
        weightKg: importRow.mapped.weightKg,
        measuredAt,
        note: "Imported weight",
      },
    });
    await prisma.pet.update({ where: { id: pet.id }, data: { weightKg: importRow.mapped.weightKg } });
    state.applied.push({
      id: actionId(),
      at,
      kind: "weight",
      summary: `Weight ${importRow.mapped.weightKg} kg → ${pet.name}`,
      entityId: pet.id,
      rowId,
    });
  }

  if (options?.includeLogs !== false) {
    for (const log of importRow.suggestedLogs.filter((l) => l.selected)) {
      const occurredAt = log.occurredAt ? new Date(log.occurredAt) : new Date();
      const entry = await prisma.logEntry.create({
        data: {
          petId: pet.id,
          rawText: log.rawText,
          occurredAt,
          type: log.type,
          severity: "NONE",
          title: log.title,
          summary: null,
          tags: "[]",
          aiProcessed: true,
        },
      });
      state.applied.push({
        id: actionId(),
        at,
        kind: "log",
        summary: `Log “${log.title}” → ${pet.name}`,
        entityId: entry.id,
        rowId,
      });
    }
  }

  state.rows[idx] = {
    ...importRow,
    status: "applied",
    petId: pet.id,
  };

  // Auto-link documents that still need a pet when label/file hints match this name
  for (let d = 0; d < state.documents.length; d++) {
    const doc = state.documents[d];
    if (doc.petId || doc.status !== "pending") continue;
    const hay = `${doc.label} ${doc.fileName}`.toLowerCase();
    if (hay.includes(pet.name.trim().toLowerCase())) {
      state.documents[d] = { ...doc, petId: pet.id };
    }
  }

  await saveState(importId, state);
  revalidateImportPaths(row.orgId, importId);
  return { petId: pet.id };
}

export async function applyImportDocument(
  importId: string,
  fileIndex: number,
): Promise<{ attachmentId: string } | { error: string }> {
  const loaded = await loadImportRow(importId);
  if ("error" in loaded) return loaded;

  const { row, state } = loaded;
  const docIdx = state.documents.findIndex((d) => d.fileIndex === fileIndex);
  if (docIdx < 0) return { error: "DOC_NOT_FOUND" };
  const doc = state.documents[docIdx];
  if (!doc.petId) return { error: "PET_REQUIRED" };
  if (doc.status === "applied" && doc.attachmentId) {
    return { attachmentId: doc.attachmentId };
  }

  const refs = parseImportFileRefs(row.fileRefs);
  const ref = refs[fileIndex];
  if (!ref) return { error: "FILE_NOT_FOUND" };

  const published = await publishPrivateDocBytes(ref, doc.fileName);
  if (!published) return { error: "PUBLISH_FAILED" };

  const attachment = await prisma.attachment.create({
    data: {
      petId: doc.petId,
      kind: doc.kind,
      label: doc.label.trim() || doc.fileName,
      url: published.url,
      mimeType: published.mimeType,
    },
  });

  const at = new Date().toISOString();
  state.applied.push({
    id: actionId(),
    at,
    kind: "document",
    summary: `Document “${doc.label}” → pet`,
    entityId: attachment.id,
    fileIndex,
  });

  state.documents[docIdx] = {
    ...doc,
    status: "applied",
    attachmentId: attachment.id,
  };

  await saveState(importId, state);
  revalidateImportPaths(row.orgId, importId);
  revalidatePath(`/app/pets/${doc.petId}`);
  revalidatePath(`/me/pets/${doc.petId}`);
  return { attachmentId: attachment.id };
}

export async function skipImportRow(
  importId: string,
  rowId: string,
  reason?: string,
): Promise<{ ok: true } | { error: string }> {
  const loaded = await loadImportRow(importId);
  if ("error" in loaded) return loaded;

  const { state } = loaded;
  const idx = state.rows.findIndex((r) => r.rowId === rowId);
  if (idx < 0) return { error: "ROW_NOT_FOUND" };

  state.rows[idx] = {
    ...state.rows[idx],
    status: "skipped",
    skipReason: reason?.trim() || null,
  };
  await saveState(importId, state);
  return { ok: true };
}

export async function requestImportHumanHelp(
  importId: string,
): Promise<{ ok: true } | { error: string }> {
  const access = await assertCanManageImport(importId);
  if ("error" in access) return access;
  if (access.status === "COMPLETED") return { error: "NOT_FOUND" };

  await prisma.dataImportRequest.update({
    where: { id: importId },
    data: { status: "PENDING" },
  });
  revalidateImportPaths(access.orgId, importId);
  revalidatePath("/admin");
  return { ok: true };
}

export async function finishUserImport(
  importId: string,
): Promise<{ ok: true } | { error: string }> {
  const access = await assertCanManageImport(importId);
  if ("error" in access) return access;
  if (access.status === "COMPLETED") return { ok: true };

  await prisma.dataImportRequest.update({
    where: { id: importId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
  revalidateImportPaths(access.orgId, importId);
  revalidatePath("/admin");
  return { ok: true };
}

function revalidateImportPaths(orgId: string | null, importId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/imports");
  if (importId) {
    revalidatePath(`/admin/imports/${importId}`);
    revalidatePath(`/app/import/${importId}`);
    revalidatePath(`/me/import/${importId}`);
  }
  if (orgId) {
    revalidatePath("/app");
    revalidatePath("/app/pets");
  } else {
    revalidatePath("/me");
  }
}

export type { AttachmentKind };
