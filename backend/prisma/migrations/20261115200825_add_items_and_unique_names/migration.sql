/*
  Warnings:

  - A unique constraint covering the columns `[nameNormalized]` on the table `Author` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameNormalized]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameNormalized` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameNormalized` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Book_name_key";

-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "nameNormalized" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "nameNormalized" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_nameNormalized_key" ON "Author"("nameNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Book_nameNormalized_key" ON "Book"("nameNormalized");
