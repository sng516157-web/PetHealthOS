-- AlterTable
ALTER TABLE "User" ADD COLUMN     "orgId" TEXT;

-- CreateIndex
CREATE INDEX "User_orgId_idx" ON "User"("orgId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
