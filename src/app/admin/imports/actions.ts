"use server";

import { revalidatePath } from "next/cache";
import { completeDataImport } from "@/app/actions";
import { loadImportWorkspace } from "@/lib/data-import-workspace";
import { isAdmin } from "@/lib/admin";

export {
  saveImportStateAction as saveImportWorkspaceState,
  applyImportRowAction,
  applyImportDocumentAction,
  skipImportRowAction,
} from "@/app/import/actions";

export async function completeImportFromWorkspace(importId: string, adminNote?: string) {
  if (!(await isAdmin())) return { error: "FORBIDDEN" };
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
