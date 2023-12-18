/*
  Warnings:

  - The primary key for the `SubSection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `courseProgressId` to the `SubSection` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `SubSection` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "courseProgress" DROP CONSTRAINT "courseProgress_completedVideosId_fkey";

-- AlterTable
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_pkey",
ADD COLUMN     "courseProgressId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "SubSection_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "courseProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
