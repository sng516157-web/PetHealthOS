import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { parseImportFileRefs } from "@/lib/data-import-shared";
import { streamPrivateDocRef } from "@/lib/private-doc";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ importId: string; index: string }> },
) {
  if (!(await isAdmin())) return new Response("Forbidden", { status: 403 });

  const { importId, index: indexRaw } = await params;
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
