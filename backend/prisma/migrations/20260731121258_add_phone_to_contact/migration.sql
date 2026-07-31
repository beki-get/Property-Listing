/*
  Warnings:

  - Added the required column `phone` to the `contacts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "phone" TEXT NOT NULL;
