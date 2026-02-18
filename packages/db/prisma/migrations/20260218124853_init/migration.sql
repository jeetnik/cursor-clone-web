/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `User` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "createdAt",
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "createdAt",
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "createdAt",
ADD COLUMN     "settings" JSONB,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "imageUrl",
ADD COLUMN     "token" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "File_projectId_parentId_idx" ON "File"("projectId", "parentId");

-- CreateIndex
CREATE INDEX "Message_projectId_status_idx" ON "Message"("projectId", "status");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
