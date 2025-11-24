-- Update existing test type values before changing enum
UPDATE "tests" SET "test_type" = 'mock-test' WHERE "test_type" IN ('mock', 'live');--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "test_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."test_type";--> statement-breakpoint
CREATE TYPE "public"."test_type" AS ENUM('mock-test', 'sectional', 'practice');--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "test_type" SET DATA TYPE "public"."test_type" USING "test_type"::"public"."test_type";