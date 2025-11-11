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
