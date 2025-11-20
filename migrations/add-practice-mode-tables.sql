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
