/*
  Warnings:

  - You are about to drop the column `sectionId` on the `Section` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_sectionId_fkey";

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "sectionId",
ADD COLUMN     "courseId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
