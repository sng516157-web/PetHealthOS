"use server";

import { revalidatePath } from "next/cache";
import {
  applyImportDocument,
  applyImportRowPet,
  finishUserImport,
  requestImportHumanHelp,
  skipImportRow,
} from "@/lib/data-import-apply";
import { persistImportWorkspaceState } from "@/lib/data-import-workspace";
import type { DataImportProcessingState } from "@/lib/data-import-plan";
import { notifyAdmins } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function revalidateImportUi(importId: string, orgId: string | null) {
  revalidatePath(`/admin/imports/${importId}`);
  revalidatePath(`/app/import/${importId}`);
  revalidatePath(`/me/import/${importId}`);
  revalidatePath("/admin");
  revalidatePath(orgId ? "/app" : "/me");
}

export async function saveImportStateAction(
  importId: string,
  state: DataImportProcessingState,
) {
  const res = await persistImportWorkspaceState(importId, state);
  if ("error" in res) return res;
  const row = await prisma.dataImportRequest.findUnique({
    where: { id: importId },
    select: { orgId: true },
  });
  revalidateImportUi(importId, row?.orgId ?? null);
  return { ok: true as const };
}

export async function applyImportRowAction(
  importId: string,
  rowId: string,
  options?: { includeLogs?: boolean; includeWeight?: boolean },
) {
  const res = await applyImportRowPet(importId, rowId, options);
  if ("error" in res) return res;
  const row = await prisma.dataImportRequest.findUnique({
    where: { id: importId },
    select: { orgId: true },
  });
  revalidateImportUi(importId, row?.orgId ?? null);
  return res;
}

export async function applyImportDocumentAction(importId: string, fileIndex: number) {
  const res = await applyImportDocument(importId, fileIndex);
  if ("error" in res) return res;
  const row = await prisma.dataImportRequest.findUnique({
    where: { id: importId },
    select: { orgId: true },
  });
  revalidateImportUi(importId, row?.orgId ?? null);
  return res;
}

export async function skipImportRowAction(importId: string, rowId: string, reason?: string) {
  const res = await skipImportRow(importId, rowId, reason);
  if ("error" in res) return res;
  const row = await prisma.dataImportRequest.findUnique({
    where: { id: importId },
    select: { orgId: true },
  });
  revalidateImportUi(importId, row?.orgId ?? null);
  return res;
}

export async function finishImportAction(importId: string) {
  const res = await finishUserImport(importId);
  if ("error" in res) return res;
  const row = await prisma.dataImportRequest.findUnique({
    where: { id: importId },
    select: { orgId: true },
  });
  revalidateImportUi(importId, row?.orgId ?? null);
  return res;
}

export async function requestImportHelpAction(importId: string) {
  const res = await requestImportHumanHelp(importId);
  if ("error" in res) return res;
  await notifyAdmins(
    "Data import needs help",
    `User requested human help on import ${importId}. Open /admin/imports/${importId}.`,
  );
  const row = await prisma.dataImportRequest.findUnique({
    where: { id: importId },
    select: { orgId: true },
  });
  revalidateImportUi(importId, row?.orgId ?? null);
  return res;
}
