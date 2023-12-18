-- DropForeignKey
ALTER TABLE "SubSection" DROP CONSTRAINT "SubSection_courseProgressId_fkey";

-- AlterTable
ALTER TABLE "SubSection" ALTER COLUMN "courseProgressId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "courseProgress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
