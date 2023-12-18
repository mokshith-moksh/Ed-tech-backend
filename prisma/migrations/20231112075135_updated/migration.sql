/*
  Warnings:

  - The primary key for the `SubSection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SubSection` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "courseProgress" DROP CONSTRAINT "courseProgress_completedVideosId_fkey";

-- AlterTable
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "SubSection_pkey" PRIMARY KEY ("subsectionId");

-- AddForeignKey
ALTER TABLE "courseProgress" ADD CONSTRAINT "courseProgress_completedVideosId_fkey" FOREIGN KEY ("completedVideosId") REFERENCES "SubSection"("subsectionId") ON DELETE RESTRICT ON UPDATE CASCADE;
