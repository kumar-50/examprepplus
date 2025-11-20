-- Update Practice Mode to use Sections instead of Topics
-- Created: 2025-11-17

-- 1. Drop existing weak_topics table (no data yet)
DROP TABLE IF EXISTS "weak_topics" CASCADE;

-- 2. Recreate with section_id instead of topic_id
CREATE TABLE "weak_topics" (
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

-- 3. Update revision_schedule column name
ALTER TABLE revision_schedule 
RENAME COLUMN topic_ids TO section_ids;

-- 4. Recreate indexes
CREATE INDEX "idx_weak_topics_user_id" ON "weak_topics"("user_id");
CREATE INDEX "idx_weak_topics_next_review" ON "weak_topics"("next_review_date");

-- 5. Comments
COMMENT ON TABLE "weak_topics" IS 'AI-identified weak sections for users based on performance analysis';
COMMENT ON COLUMN "revision_schedule"."section_ids" IS 'Comma-separated section IDs for this scheduled practice';
