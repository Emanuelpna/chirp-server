-- AlterTable
ALTER TABLE "Chirp" ADD COLUMN     "childOfId" INTEGER;

-- AddForeignKey
ALTER TABLE "Chirp" ADD CONSTRAINT "Chirp_childOfId_fkey" FOREIGN KEY ("childOfId") REFERENCES "Chirp"("id") ON DELETE SET NULL ON UPDATE CASCADE;
