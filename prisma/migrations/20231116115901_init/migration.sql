/*
  Warnings:

  - The `completedVideosId` column on the `courseProgress` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "courseProgress" DROP COLUMN "completedVideosId",
ADD COLUMN     "completedVideosId" TEXT[];
