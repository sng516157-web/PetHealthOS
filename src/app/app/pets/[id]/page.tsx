import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Lock, Stethoscope } from "lucide-react";
import {
  getPet,
  getActiveOrg,
  isFacilityOrg,
  getFacilityPetView,
  getPetEntitlements,
} from "@/lib/data";
import { QuickAddLog } from "@/components/QuickAddLog";
import { UnifiedLogTimeline } from "@/components/UnifiedLogTimeline";
import { DeleteShopPetPanel } from "@/components/DeleteShopPetPanel";
import { MotionStagger } from "@/components/dashboard/DashboardMotion";
import {
  serializeHealthLogs,
  serializeFoodLogs,
  serializeActivityLogs,
  serializeMedicationLogs,
} from "@/lib/pet-serialize";
import { buildUnifiedLogTimeline } from "@/lib/unified-logs";
import { SEVERITY_META, Severity } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

async function loadAppPet(id: string) {
  const org = await getActiveOrg();
  if (org && isFacilityOrg(org)) {
    const view = await getFacilityPetView(id);
    if (!view) return null;
    const ent = await getPetEntitlements(id);
    const canLog = view.active && (ent?.canLog ?? true);
    return {
      pet: view.pet,
      facility: true as const,
      facilityActive: view.active,
      canLog,
      canUseAI: view.active && (ent?.canUseAI ?? true),
    };
  }
  const pet = await getPet(id);
  if (!pet) return null;
  const ent = await getPetEntitlements(id);
  const canLog = ent?.canLog ?? true;
  return {
    pet,
    facility: false as const,
    facilityActive: true,
    canLog,
    canUseAI: ent?.canUseAI ?? true,
  };
}

export default async function AppPetQuickLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const ctx = await loadAppPet(id);
  if (!ctx) notFound();

  const logs = serializeHealthLogs(ctx.pet.logs);
  const timeline = buildUnifiedLogTimeline({
    health: logs,
    food: serializeFoodLogs(ctx.pet.foodLogs),
    activity: serializeActivityLogs(ctx.pet.activityLogs),
    medication: serializeMedicationLogs(ctx.pet.medicationLogs ?? []),
  });

  if (ctx.facility && !ctx.facilityActive) {
    return (
      <MotionStagger className="space-y-5" step={90} itemClassName="">
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-soft">
          <Lock size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <p>{t.facility.readonlyNotice}</p>
        </div>
        <UnifiedLogTimeline petId={ctx.pet.id} items={timeline} canDelete={false} canEdit={false} />
      </MotionStagger>
    );
  }

  const now = Date.now();
  const flagged = ctx.pet.logs.filter(
    (l) =>
      now - l.occurredAt.getTime() < 1000 * 60 * 60 * 24 * 14 &&
      SEVERITY_META[l.severity as Severity].rank >= 3,
  );

  let deletePanel = null;
  if (!ctx.facility) {
    const deleteMeta = await prisma.pet.findUnique({
      where: { id },
      select: {
        ownerUserId: true,
        status: true,
        _count: { select: { transfers: true } },
      },
    });
    const showDelete =
      deleteMeta &&
      !deleteMeta.ownerUserId &&
      deleteMeta._count.transfers === 0 &&
      ["ACTIVE", "UNDER_OBSERVATION"].includes(deleteMeta.status);
    if (showDelete) {
      deletePanel = (
        <DeleteShopPetPanel petId={ctx.pet.id} petName={ctx.pet.name} />
      );
    }
  }

  return (
    <MotionStagger className="space-y-5" step={90} itemClassName="">
      {!ctx.facility && flagged.length > 0 && ctx.canUseAI ? (
        <Link
          href={`/app/pets/${ctx.pet.id}/triage`}
          className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-soft transition hover:border-orange-300 hover:bg-orange-100/70"
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-900">
              {t.petDetail.attentionTitle(flagged.length)}
            </p>
            <p className="mt-0.5 text-sm text-orange-800">
              {t.petDetail.attentionDesc(ctx.pet.name)}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-orange-900 underline">
              <Stethoscope size={14} /> {t.petDetail.goToTriage}
            </span>
          </div>
        </Link>
      ) : null}
      {ctx.canLog ? <QuickAddLog petId={ctx.pet.id} /> : null}
      <UnifiedLogTimeline petId={ctx.pet.id} items={timeline} canDelete={false} canEdit={false} />
      {!ctx.facility && ctx.pet.notes ? (
        <div className="rounded-2xl border border-border bg-surface/90 p-4 shadow-soft backdrop-blur">
          <h3 className="text-sm font-semibold text-foreground">{t.petDetail.profileNotes}</h3>
          <p className="mt-2 text-sm text-slate-600">{ctx.pet.notes}</p>
        </div>
      ) : null}
      {deletePanel}
    </MotionStagger>
  );
}
