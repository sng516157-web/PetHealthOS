import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet } from "@/lib/data";
import { hasAI } from "@/lib/ai";
import { ChatPanel } from "@/components/ChatPanel";
import { MotionReveal } from "@/components/dashboard/DashboardMotion";
import { getI18n } from "@/lib/i18n/server";

export default async function MePetChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const pet = await getOwnedPet(user.id, id);
  if (!pet) notFound();
  const { t } = await getI18n();

  return (
    <div>
      {!hasAI() && (
        <MotionReveal>
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
            <strong>{t.common.demoBadge}:</strong> {t.chat.demoNote}{" "}
            <code className="rounded bg-amber-100 px-1">GROQ_API_KEY</code>{" "}
            <code className="rounded bg-amber-100 px-1">.env</code> {t.chat.demoNoteEnd}
          </div>
        </MotionReveal>
      )}
      <MotionReveal delay={80}>
        <ChatPanel petId={pet.id} petName={pet.name} aiEnabled={hasAI()} />
      </MotionReveal>
    </div>
  );
}
