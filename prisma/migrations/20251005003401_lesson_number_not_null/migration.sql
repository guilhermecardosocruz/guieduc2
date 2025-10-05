/*
  Warnings:

  - Made the column `number` on table `Lesson` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "number" SET NOT NULL;
