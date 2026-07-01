import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasAI } from "@/lib/ai";
import { ChatPanel } from "@/components/ChatPanel";
import { MotionPop } from "@/components/dashboard/DashboardMotion";
import { getI18n } from "@/lib/i18n/server";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const pet = await prisma.pet.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!pet) notFound();

  return (
    <div>
      {!hasAI() && (
        <MotionPop index={0}>
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
            <strong>{t.common.demoBadge}:</strong> {t.chat.demoNote}{" "}
            <code className="rounded bg-amber-100 px-1">GROQ_API_KEY</code>{" "}
            <code className="rounded bg-amber-100 px-1">.env</code> {t.chat.demoNoteEnd}
          </div>
        </MotionPop>
      )}
      <MotionPop index={1}>
        <ChatPanel petId={pet.id} petName={pet.name} aiEnabled={hasAI()} />
      </MotionPop>
    </div>
  );
}
