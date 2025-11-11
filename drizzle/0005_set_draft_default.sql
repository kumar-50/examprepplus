-- ============================================
-- Update Question Status Default to Draft
-- Task 10: Part 2 - Set default and update existing records
-- ============================================

-- Update default for new questions
ALTER TABLE questions 
ALTER COLUMN status SET DEFAULT 'draft';

-- Add comment for documentation
COMMENT ON TYPE question_status IS 'Question approval status: draft (initial), pending (submitted for review), approved (verified), or rejected';
