/*
  Warnings:

  - The primary key for the `SubSection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `SubSection` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "courseProgress" DROP CONSTRAINT "courseProgress_completedVideosId_fkey";

-- AlterTable
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "SubSection_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "courseProgress" ADD CONSTRAINT "courseProgress_completedVideosId_fkey" FOREIGN KEY ("completedVideosId") REFERENCES "SubSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
