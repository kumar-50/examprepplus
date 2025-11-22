-- ============================================
-- ExamPrepPlus - Complete Production Migration
-- Generated: 2025-11-22 14:26:12
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- for fresh production database setup
-- ============================================


-- ============================================
-- BASE SCHEMA - Core Tables
-- File: drizzle\0000_green_blink.sql
-- ============================================
CREATE TYPE "public"."subscription_status" AS ENUM('free', 'active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."exam_type" AS ENUM('RRB_NTPC', 'SSC_CGL', 'BANK_PO', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."test_type" AS ENUM('mock', 'live', 'sectional', 'practice');--> statement-breakpoint
CREATE TYPE "public"."attempt_status" AS ENUM('in_progress', 'submitted', 'auto_submitted');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text,
	"email" text NOT NULL,
	"phone" text,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'free' NOT NULL,
	"subscription_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"exam_type" "exam_type" DEFAULT 'RRB_NTPC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"section_id" uuid NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_text" text NOT NULL,
	"option_1" text NOT NULL,
	"option_2" text NOT NULL,
	"option_3" text NOT NULL,
	"option_4" text NOT NULL,
	"correct_option" integer NOT NULL,
	"explanation" text,
	"section_id" uuid NOT NULL,
	"topic_id" uuid,
	"difficulty_level" "difficulty_level" DEFAULT 'medium' NOT NULL,
	"has_equation" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"created_by" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"test_type" "test_type" NOT NULL,
	"total_questions" integer NOT NULL,
	"total_marks" integer NOT NULL,
	"duration" integer NOT NULL,
	"negative_marking" boolean DEFAULT false NOT NULL,
	"negative_marking_value" integer DEFAULT 0,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"instructions" text,
	"test_pattern" json,
	"scheduled_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_order" integer NOT NULL,
	"marks" integer NOT NULL,
	"section_id" uuid,
	CONSTRAINT "test_questions_test_id_question_id_unique" UNIQUE("test_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "user_test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"test_id" uuid NOT NULL,
	"status" "attempt_status" DEFAULT 'in_progress' NOT NULL,
	"score" integer,
	"total_marks" integer NOT NULL,
	"correct_answers" integer DEFAULT 0,
	"incorrect_answers" integer DEFAULT 0,
	"unanswered" integer DEFAULT 0,
	"section_breakdown" json,
	"topic_breakdown" json,
	"time_spent" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"rank" integer,
	"percentile" integer
);
--> statement-breakpoint
CREATE TABLE "user_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option" integer,
	"is_correct" boolean,
	"is_reviewed" boolean DEFAULT false NOT NULL,
	"time_spent" integer DEFAULT 0,
	"answered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"duration_days" integer NOT NULL,
	"features" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"razorpay_signature" text,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"discount_value" integer NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "coupon_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"discount_applied" integer NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_test_attempts" ADD CONSTRAINT "user_test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_test_attempts" ADD CONSTRAINT "user_test_attempts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_attempt_id_user_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."user_test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;

-- ============================================
-- AUTH TRIGGERS
-- File: drizzle\0001_auth_triggers.sql
-- ============================================
-- ============================================
-- Auth Triggers Migration (Idempotent)
-- ============================================
-- This migration is safe to run multiple times
-- It will only create what doesn't exist
-- ============================================

-- 1. Create function to sync new auth users to public.users
-- Using CREATE OR REPLACE makes this idempotent
-- Includes all required NOT NULL fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    role,
    subscription_status,
    is_active,
    created_at, 
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user',  -- Default role
    'free',  -- Default subscription
    true,    -- Active by default
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
  
  RETURN new;
END;
$$;

-- 2. Create trigger on auth.users insert
-- Using DROP IF EXISTS makes this idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Create function to track user logins
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.users
  SET 
    last_login_at = now(),
    updated_at = now()
  WHERE id = new.user_id;
  
  RETURN new;
END;
$$;

-- 4. Create trigger on auth.sessions insert
DROP TRIGGER IF EXISTS on_user_login ON auth.sessions;
CREATE TRIGGER on_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_user_login();

-- ============================================
-- VERIFICATION (Optional - comment out for actual migration)
-- ============================================
-- Uncomment to verify triggers were created:
-- SELECT trigger_name, event_object_table, action_timing, event_manipulation
-- FROM information_schema.triggers 
-- WHERE trigger_name IN ('on_auth_user_created', 'on_user_login')
-- ORDER BY trigger_name;


-- ============================================
-- AUTH TRIGGER FIX
-- File: drizzle\0002_fix_auth_trigger.sql
-- ============================================
-- ============================================
-- Fix auth trigger to include all required fields
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    role,
    subscription_status,
    is_active,
    created_at, 
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user',
    'free',
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
  
  RETURN new;
END;
$$;


-- ============================================
-- QUESTION VERIFICATION
-- File: drizzle\0003_add_question_verification.sql
-- ============================================
-- ============================================
-- Add Question Verification Columns
-- Task 10: Test Builder - Question Approval System
-- ============================================

-- Create enum for question status
DO $$ BEGIN
  CREATE TYPE question_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS status question_status DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_is_verified ON questions(is_verified);
CREATE INDEX IF NOT EXISTS idx_questions_verified_by ON questions(verified_by);

-- Update existing questions to approved status (migration safety)
-- Only update active questions that don't already have a status set
UPDATE questions 
SET 
  status = 'approved',
  is_verified = true,
  verified_at = NOW()
WHERE is_active = true 
  AND status = 'pending';

-- Add comment for documentation
COMMENT ON COLUMN questions.status IS 'Question approval status: pending, approved, or rejected';
COMMENT ON COLUMN questions.is_verified IS 'Whether question has been verified by an admin';
COMMENT ON COLUMN questions.verified_by IS 'Admin user who verified this question';
COMMENT ON COLUMN questions.verified_at IS 'Timestamp when question was verified';


-- ============================================
-- CLEANUP DRAFT STATUS
-- File: drizzle\0006_remove_draft_status.sql
-- ============================================
-- Migration: Remove draft status, keep pending, approved, rejected
-- Update any existing draft questions to pending
UPDATE questions SET status = 'pending' WHERE status = 'draft';

-- Drop default before changing type
ALTER TABLE questions ALTER COLUMN status DROP DEFAULT;

-- Remove draft from enum
ALTER TYPE question_status RENAME TO question_status_old;
CREATE TYPE question_status AS ENUM ('pending', 'approved', 'rejected');
ALTER TABLE questions ALTER COLUMN status TYPE question_status USING status::text::question_status;
DROP TYPE question_status_old;

-- Set default to pending
ALTER TABLE questions ALTER COLUMN status SET DEFAULT 'pending';


-- ============================================
-- TEST CONFIGURATION FIELDS
-- File: drizzle\0007_add_test_fields.sql
-- ============================================
-- Add new columns to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS average_rating REAL DEFAULT 0;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS total_attempts INTEGER DEFAULT 0;


-- ============================================
-- PRACTICE MODE TABLES
-- File: migrations\add-practice-mode-tables.sql
-- ============================================
-- Practice Mode Migration (Unified Schema Approach)
-- Created: 2025-11-17
-- Description: Extends existing tables for practice mode instead of creating duplicates

-- 1. Add practice-specific fields to user_test_attempts
ALTER TABLE user_test_attempts 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP;

-- Add comment
COMMENT ON COLUMN user_test_attempts.scheduled_for IS 'For practice mode: when this session is scheduled for spaced repetition';

-- 2. Weak Topics Table (separate - for performance analysis)
CREATE TABLE IF NOT EXISTS "weak_topics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "section_id" UUID NOT NULL REFERENCES "sections"("id") ON DELETE CASCADE,
  "total_attempts" INTEGER NOT NULL DEFAULT 0,
  "correct_attempts" INTEGER NOT NULL DEFAULT 0,
  "accuracy_percentage" INTEGER NOT NULL DEFAULT 0,
  "last_practiced_at" TIMESTAMP,
  "next_review_date" TIMESTAMP,
  "review_count" INTEGER NOT NULL DEFAULT 0,
  "weakness_level" TEXT,
  "identified_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("user_id", "section_id")
);

-- 3. Revision Schedule Table (separate - for scheduling metadata)
CREATE TABLE IF NOT EXISTS "revision_schedule" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "scheduled_date" TIMESTAMP NOT NULL,
  "attempt_id" UUID REFERENCES "user_test_attempts"("id") ON DELETE SET NULL,
  "section_ids" TEXT, -- Comma-separated section IDs
  "difficulty" TEXT,
  "question_count" INTEGER NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_user_test_attempts_scheduled" ON "user_test_attempts"("scheduled_for");
CREATE INDEX IF NOT EXISTS "idx_weak_topics_user_id" ON "weak_topics"("user_id");
CREATE INDEX IF NOT EXISTS "idx_weak_topics_next_review" ON "weak_topics"("next_review_date");
CREATE INDEX IF NOT EXISTS "idx_revision_schedule_user_id" ON "revision_schedule"("user_id");
CREATE INDEX IF NOT EXISTS "idx_revision_schedule_date" ON "revision_schedule"("scheduled_date");

-- 5. Comments
COMMENT ON TABLE "weak_topics" IS 'AI-identified weak areas for users based on performance analysis';
COMMENT ON TABLE "revision_schedule" IS 'Spaced repetition schedule for practice sessions';

-- 6. Note: Practice sessions now use:
--    - tests table with test_type='practice'
--    - user_test_attempts for tracking attempts
--    - user_answers for individual question responses
--    - No separate practice_sessions or practice_answers tables needed!


-- ============================================
-- STREAK TRACKING TABLES (NEW)
-- File: migrations\add-practice-streaks.sql
-- ============================================
-- Add practice streak tracking tables

-- Practice Streaks table
CREATE TABLE IF NOT EXISTS practice_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_practice_date DATE,
  streak_start_date DATE,
  total_practice_days INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Practice Calendar table
CREATE TABLE IF NOT EXISTS practice_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  questions_answered INTEGER DEFAULT 0 NOT NULL,
  correct_answers INTEGER DEFAULT 0 NOT NULL,
  practice_minutes INTEGER DEFAULT 0 NOT NULL,
  sessions_completed INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, practice_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_streaks_user_id ON practice_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_calendar_user_id ON practice_calendar(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_calendar_date ON practice_calendar(practice_date);
CREATE INDEX IF NOT EXISTS idx_practice_calendar_user_date ON practice_calendar(user_id, practice_date);

-- Enable RLS
ALTER TABLE practice_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_calendar ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_streaks
CREATE POLICY "Users can view their own streaks"
  ON practice_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON practice_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON practice_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for practice_calendar
CREATE POLICY "Users can view their own calendar"
  ON practice_calendar FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar entries"
  ON practice_calendar FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar entries"
  ON practice_calendar FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after applying the migration above

-- 1. Check all tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected: 17 tables

-- 2. Verify practice tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'weak_topics', 
  'revision_schedule',
  'practice_streaks', 
  'practice_calendar'
)
ORDER BY table_name;
-- Expected: 4 rows

-- 3. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
-- All should show 't' (true)

-- ✅ If all checks pass, migration is complete!
