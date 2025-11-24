-- Convert column to text first
ALTER TABLE "tests" ALTER COLUMN "test_type" SET DATA TYPE text;--> statement-breakpoint
-- Update existing test type values before changing enum
UPDATE "tests" SET "test_type" = 'mock-test' WHERE "test_type" IN ('mock', 'live');--> statement-breakpoint
-- Drop and recreate enum
DROP TYPE "public"."test_type";--> statement-breakpoint
CREATE TYPE "public"."test_type" AS ENUM('mock-test', 'sectional', 'practice');--> statement-breakpoint
-- Convert column back to enum
ALTER TABLE "tests" ALTER COLUMN "test_type" SET DATA TYPE "public"."test_type" USING "test_type"::"public"."test_type";