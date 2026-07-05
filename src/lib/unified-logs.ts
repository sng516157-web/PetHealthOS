import type { SerializedLog } from "@/components/LogTimeline";
import type { SerializedFoodLog } from "@/components/FoodLogPanel";
import type { SerializedActivityLog } from "@/components/ActivityLogPanel";
import type { SerializedMedicationLog } from "@/components/MedicationLogPanel";
import type { LogBucket } from "@/lib/constants";

export type UnifiedLogItem =
  | ({ kind: "health" } & SerializedLog)
  | ({ kind: "food" } & SerializedFoodLog)
  | ({ kind: "activity" } & SerializedActivityLog)
  | ({ kind: "medication" } & SerializedMedicationLog);

export function buildUnifiedLogTimeline(opts: {
  health: SerializedLog[];
  food: SerializedFoodLog[];
  activity: SerializedActivityLog[];
  medication: SerializedMedicationLog[];
}): UnifiedLogItem[] {
  const items: UnifiedLogItem[] = [
    ...opts.health.map((l) => ({ kind: "health" as const, ...l })),
    ...opts.food.map((l) => ({ kind: "food" as const, ...l })),
    ...opts.activity.map((l) => ({ kind: "activity" as const, ...l })),
    ...opts.medication.map((l) => ({ kind: "medication" as const, ...l })),
  ];
  items.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  return items;
}

export function unifiedItemBucket(item: UnifiedLogItem): LogBucket {
  return item.kind;
}
