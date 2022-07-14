-- DropForeignKey
ALTER TABLE "Chirp" DROP CONSTRAINT "Chirp_parentToId_fkey";

-- AlterTable
ALTER TABLE "Chirp" ALTER COLUMN "parentToId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chirp" ADD CONSTRAINT "Chirp_parentToId_fkey" FOREIGN KEY ("parentToId") REFERENCES "Chirp"("id") ON DELETE SET NULL ON UPDATE CASCADE;
