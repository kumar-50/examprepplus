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
