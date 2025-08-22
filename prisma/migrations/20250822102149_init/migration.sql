/*
  Warnings:

  - The primary key for the `Quotation` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Quotation" DROP CONSTRAINT "Quotation_pkey",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Quotation_id_seq";
