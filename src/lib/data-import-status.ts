/** Lifecycle for `DataImportRequest.status` (string column — no Prisma enum). */
export const DATA_IMPORT_STATUSES = [
  "DRAFTING",
  "READY_FOR_REVIEW",
  "PENDING",
  "COMPLETED",
] as const;

export type DataImportStatus = (typeof DATA_IMPORT_STATUSES)[number];

/** Blocks a second upload while any of these are open. */
export const DATA_IMPORT_ACTIVE_STATUSES: DataImportStatus[] = [
  "DRAFTING",
  "READY_FOR_REVIEW",
  "PENDING",
];

/** Admin queue: needs human help or draft never finished. */
export const DATA_IMPORT_ADMIN_QUEUE_STATUSES: DataImportStatus[] = [
  "PENDING",
  "DRAFTING",
];
