/*
  Warnings:

  - A unique constraint covering the columns `[classId,number]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "number" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_classId_number_key" ON "Lesson"("classId", "number");
