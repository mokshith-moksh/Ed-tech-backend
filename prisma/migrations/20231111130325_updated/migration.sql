/*
  Warnings:

  - You are about to drop the column `resetPasswordExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `OTP` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToCourse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToCourse" DROP CONSTRAINT "_CategoryToCourse_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToCourse" DROP CONSTRAINT "_CategoryToCourse_B_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetPasswordExpires",
DROP COLUMN "token";

-- DropTable
DROP TABLE "OTP";

-- DropTable
DROP TABLE "_CategoryToCourse";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
