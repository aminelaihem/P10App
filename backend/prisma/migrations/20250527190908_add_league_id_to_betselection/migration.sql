/*
  Warnings:

  - A unique constraint covering the columns `[userId,gpId,leagueId]` on the table `BetSelectionResult` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `leagueId` to the `BetSelectionResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BetSelectionResult_userId_gpId_key";

-- AlterTable
ALTER TABLE "BetSelectionResult" ADD COLUMN     "leagueId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BetSelectionResult_userId_gpId_leagueId_key" ON "BetSelectionResult"("userId", "gpId", "leagueId");

-- AddForeignKey
ALTER TABLE "BetSelectionResult" ADD CONSTRAINT "BetSelectionResult_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
