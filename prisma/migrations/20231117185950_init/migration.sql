/*
  Warnings:

  - The primary key for the `Section` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sectionId` on the `Section` table. All the data in the column will be lost.
  - The primary key for the `SubSection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `subsectionId` on the `SubSection` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `Section` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Section` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `SubSection` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `sectionId` to the `SubSection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_subsectionId_fkey";

-- AlterTable
ALTER TABLE "Section" DROP CONSTRAINT "Section_pkey",
DROP COLUMN "sectionId",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Section_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_pkey",
DROP COLUMN "subsectionId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "sectionId" TEXT NOT NULL,
ADD CONSTRAINT "SubSection_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
