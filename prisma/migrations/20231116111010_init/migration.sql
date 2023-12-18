/*
  Warnings:

  - The primary key for the `Section` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Section` table. All the data in the column will be lost.
  - The primary key for the `SubSection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SubSection` table. All the data in the column will be lost.
  - The primary key for the `courseProgress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `courseProgress` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_courseProgressId_fkey";

-- DropForeignKey
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_subsectionId_fkey";

-- AlterTable
ALTER TABLE "Section" DROP CONSTRAINT "Section_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Section_pkey" PRIMARY KEY ("courseId");

-- AlterTable
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "SubSection_pkey" PRIMARY KEY ("subsectionId");

-- AlterTable
ALTER TABLE "courseProgress" DROP CONSTRAINT "courseProgress_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "courseProgress_pkey" PRIMARY KEY ("coursesId");

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Section"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "courseProgress"("coursesId") ON DELETE RESTRICT ON UPDATE CASCADE;
