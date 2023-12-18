/*
  Warnings:

  - The primary key for the `courseProgress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `courseProgress` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_courseProgressId_fkey";

-- AlterTable
ALTER TABLE "courseProgress" DROP CONSTRAINT "courseProgress_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "courseProgress_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "courseProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
