import { hasAI } from "@/lib/ai";
import { getOrgPetsForAI } from "@/lib/data";
import { OrgAiWorkspace } from "@/components/OrgAiWorkspace";
import { MotionReveal } from "@/components/dashboard/DashboardMotion";
import { getI18n } from "@/lib/i18n/server";

export default async function OrgAiPage() {
  const [{ facility, pets }, { t }] = await Promise.all([
    getOrgPetsForAI(),
    getI18n(),
  ]);

  return (
    <>
      {!hasAI() && (
        <MotionReveal>
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
            <strong>{t.common.demoBadge}:</strong> {t.orgAi.demoNote}{" "}
            <code className="rounded bg-amber-100 px-1">AI_GATEWAY_API_KEY</code>{" "}
            <code className="rounded bg-amber-100 px-1">.env</code> {t.chat.demoNoteEnd}
          </div>
        </MotionReveal>
      )}
      <OrgAiWorkspace
        facility={facility}
        petCount={pets.length}
        aiEnabled={hasAI()}
        preview={false}
      />
    </>
  );
}
