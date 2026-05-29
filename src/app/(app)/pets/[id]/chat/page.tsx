import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasAI } from "@/lib/ai";
import { ChatPanel } from "@/components/ChatPanel";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pet = await prisma.pet.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!pet) notFound();

  return (
    <div>
      {!hasAI() && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Demo mode:</strong> no AI key detected. The assistant will
          summarize the log with simple rules. Set{" "}
          <code className="rounded bg-amber-100 px-1">AI_GATEWAY_API_KEY</code> in{" "}
          <code className="rounded bg-amber-100 px-1">.env</code> for full
          natural-language answers.
        </div>
      )}
      <ChatPanel petId={pet.id} petName={pet.name} aiEnabled={hasAI()} />
    </div>
  );
}
