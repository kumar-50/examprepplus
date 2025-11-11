-- ============================================
-- Update Question Status Enum - Add Draft Status
-- Task 10: Change default status to draft
-- ============================================

-- Step 1: Add 'draft' to the enum (must be committed before use)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'draft' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_status')
  ) THEN
    ALTER TYPE question_status ADD VALUE 'draft' BEFORE 'pending';
  END IF;
END $$;
