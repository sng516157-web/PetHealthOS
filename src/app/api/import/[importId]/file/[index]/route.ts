import { prisma } from "@/lib/prisma";
import { assertCanManageImport } from "@/lib/data-import-access";
import { parseImportFileRefs } from "@/lib/data-import-shared";
import { streamPrivateDocRef } from "@/lib/private-doc";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ importId: string; index: string }> },
) {
  const { importId, index: indexRaw } = await params;
  const access = await assertCanManageImport(importId);
  if ("error" in access) {
    return new Response(access.error === "FORBIDDEN" ? "Forbidden" : "Not found", {
      status: access.error === "FORBIDDEN" ? 403 : 404,
    });
  }

  const index = Number.parseInt(indexRaw, 10);
  if (!Number.isFinite(index) || index < 0) {
    return new Response("Bad request", { status: 400 });
  }

  const row = await prisma.dataImportRequest.findUnique({ where: { id: importId } });
  if (!row) return new Response("Not found", { status: 404 });

  const refs = parseImportFileRefs(row.fileRefs);
  const ref = refs[index];
  if (!ref) return new Response("Not found", { status: 404 });

  return streamPrivateDocRef(ref);
}
