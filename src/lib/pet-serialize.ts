import { safeTags } from "@/lib/ai";

export function serializeHealthLogs(
  logs: {
    id: string;
    occurredAt: Date;
    rawText: string;
    type: string;
    severity: string;
    title: string | null;
    summary: string | null;
    tags: string;
    imageUrl: string | null;
    imageMime: string | null;
    loggedByName: string | null;
    lockedAt?: Date | null;
  }[],
) {
  return logs.map((l) => ({
    id: l.id,
    occurredAt: l.occurredAt.toISOString(),
    rawText: l.rawText,
    type: l.type,
    severity: l.severity,
    title: l.title,
    summary: l.summary,
    tags: safeTags(l.tags),
    imageUrl: l.imageUrl,
    imageMime: l.imageMime,
    loggedByName: l.loggedByName,
    lockedAt: l.lockedAt?.toISOString() ?? null,
  }));
}

export function serializeReminders(
  reminders: {
    id: string;
    title: string;
    category: string;
    dueAt: Date;
    recurrence: string | null;
    completed: boolean;
    notes: string | null;
  }[],
) {
  return reminders.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    dueAt: r.dueAt.toISOString(),
    recurrence: r.recurrence,
    completed: r.completed,
    notes: r.notes,
  }));
}

export function serializeWeights(
  weights: {
    id: string;
    weightKg: number;
    measuredAt: Date;
    note: string | null;
  }[],
) {
  return weights.map((w) => ({
    id: w.id,
    weightKg: w.weightKg,
    measuredAt: w.measuredAt.toISOString(),
    note: w.note,
  }));
}

export function serializeAttachments(
  attachments: {
    id: string;
    kind: string;
    label: string;
    url: string;
    mimeType: string | null;
  }[],
) {
  return attachments.map((a) => ({
    id: a.id,
    kind: a.kind,
    label: a.label,
    url: a.url,
    mimeType: a.mimeType,
  }));
}

export function serializeFoodLogs(
  entries: {
    id: string;
    occurredAt: Date;
    mealType: string;
    foodName: string | null;
    amount: string | null;
    appetite: string | null;
    notes: string | null;
    lockedAt?: Date | null;
  }[],
) {
  return entries.map((e) => ({
    id: e.id,
    occurredAt: e.occurredAt.toISOString(),
    mealType: e.mealType,
    foodName: e.foodName ?? "",
    amount: e.amount ?? "",
    appetite: e.appetite ?? "NORMAL",
    notes: e.notes ?? "",
    lockedAt: e.lockedAt?.toISOString() ?? null,
  }));
}

export function serializeActivityLogs(
  entries: {
    id: string;
    occurredAt: Date;
    activityType: string;
    durationMin: number | null;
    distanceKm: number | null;
    intensity: string | null;
    notes: string | null;
    lockedAt?: Date | null;
  }[],
) {
  return entries.map((e) => ({
    id: e.id,
    occurredAt: e.occurredAt.toISOString(),
    activityType: e.activityType,
    durationMin: e.durationMin,
    distanceKm: e.distanceKm,
    intensity: e.intensity ?? "MODERATE",
    notes: e.notes ?? "",
    lockedAt: e.lockedAt?.toISOString() ?? null,
  }));
}

export function serializeMedicationLogs(
  entries: {
    id: string;
    occurredAt: Date;
    medicationName: string;
    dose: string | null;
    route: string | null;
    notes: string | null;
    lockedAt?: Date | null;
  }[],
) {
  return entries.map((e) => ({
    id: e.id,
    occurredAt: e.occurredAt.toISOString(),
    medicationName: e.medicationName,
    dose: e.dose ?? "",
    route: e.route ?? "ORAL",
    notes: e.notes ?? "",
    lockedAt: e.lockedAt?.toISOString() ?? null,
  }));
}
