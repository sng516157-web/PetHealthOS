-- CreateTable
CREATE TABLE "DataImportRequest" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orgId" TEXT,
    "userId" TEXT NOT NULL,
    "fileRefs" TEXT NOT NULL,
    "fileNames" TEXT NOT NULL,
    "note" TEXT,
    "adminNote" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DataImportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataImportRequest_status_submittedAt_idx" ON "DataImportRequest"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "DataImportRequest_orgId_idx" ON "DataImportRequest"("orgId");

-- CreateIndex
CREATE INDEX "DataImportRequest_userId_idx" ON "DataImportRequest"("userId");

-- AddForeignKey
ALTER TABLE "DataImportRequest" ADD CONSTRAINT "DataImportRequest_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImportRequest" ADD CONSTRAINT "DataImportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
