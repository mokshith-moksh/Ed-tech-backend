/*
  Warnings:

  - The primary key for the `Section` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `courseId` on the `Section` table. All the data in the column will be lost.
  - Added the required column `sectionId` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_courseId_fkey";

-- DropForeignKey
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_subsectionId_fkey";

-- AlterTable
ALTER TABLE "Section" DROP CONSTRAINT "Section_pkey",
DROP COLUMN "courseId",
ADD COLUMN     "sectionId" TEXT NOT NULL,
ADD CONSTRAINT "Section_pkey" PRIMARY KEY ("sectionId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Section"("sectionId") ON DELETE RESTRICT ON UPDATE CASCADE;
