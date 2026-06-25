"use server";

import { revalidatePath } from "next/cache";
import {
  applyImportDocument,
  applyImportRowPet,
  skipImportRow,
} from "@/lib/data-import-apply";
import {
  loadImportWorkspace,
  persistImportWorkspaceState,
} from "@/lib/data-import-workspace";
import type { DataImportProcessingState } from "@/lib/data-import-plan";
import { completeDataImport } from "@/app/actions";

export async function saveImportWorkspaceState(
  importId: string,
  state: DataImportProcessingState,
) {
  const res = await persistImportWorkspaceState(importId, state);
  if ("error" in res) return res;
  revalidatePath(`/admin/imports/${importId}`);
  return { ok: true as const };
}

export async function applyImportRowAction(
  importId: string,
  rowId: string,
  options?: { includeLogs?: boolean; includeWeight?: boolean },
) {
  const res = await applyImportRowPet(importId, rowId, options);
  if ("error" in res) return res;
  revalidatePath(`/admin/imports/${importId}`);
  return res;
}

export async function applyImportDocumentAction(importId: string, fileIndex: number) {
  const res = await applyImportDocument(importId, fileIndex);
  if ("error" in res) return res;
  revalidatePath(`/admin/imports/${importId}`);
  return res;
}

export async function skipImportRowAction(importId: string, rowId: string, reason?: string) {
  const res = await skipImportRow(importId, rowId, reason);
  if ("error" in res) return res;
  revalidatePath(`/admin/imports/${importId}`);
  return res;
}

export async function completeImportFromWorkspace(importId: string, adminNote?: string) {
  const fd = new FormData();
  fd.set("importId", importId);
  fd.set("adminNote", adminNote ?? "");
  const res = await completeDataImport(fd);
  if (res?.error) return { error: res.error };
  revalidatePath(`/admin/imports/${importId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function refreshImportWorkspace(importId: string) {
  return loadImportWorkspace(importId);
}
