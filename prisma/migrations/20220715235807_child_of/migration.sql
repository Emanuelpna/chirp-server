/*
  Warnings:

  - You are about to drop the column `childOfId` on the `Chirp` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chirp" DROP CONSTRAINT "Chirp_childOfId_fkey";

-- AlterTable
ALTER TABLE "Chirp" DROP COLUMN "childOfId";

-- CreateTable
CREATE TABLE "ReChirp" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "ReChirp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChirpToReChirp" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChirpToReChirp_AB_unique" ON "_ChirpToReChirp"("A", "B");

-- CreateIndex
CREATE INDEX "_ChirpToReChirp_B_index" ON "_ChirpToReChirp"("B");

-- AddForeignKey
ALTER TABLE "ReChirp" ADD CONSTRAINT "ReChirp_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChirpToReChirp" ADD CONSTRAINT "_ChirpToReChirp_A_fkey" FOREIGN KEY ("A") REFERENCES "Chirp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChirpToReChirp" ADD CONSTRAINT "_ChirpToReChirp_B_fkey" FOREIGN KEY ("B") REFERENCES "ReChirp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
