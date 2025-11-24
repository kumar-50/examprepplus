-- Update goal_type enum to include 'monthly' instead of 'custom'
-- This script safely migrates the enum and updates existing data

BEGIN;

-- Step 1: Add 'monthly' to the enum
ALTER TYPE goal_type ADD VALUE IF NOT EXISTS 'monthly';

-- Step 2: Update any existing 'custom' goals to 'monthly' (if they exist)
UPDATE user_goals 
SET goal_type = 'monthly' 
WHERE goal_type = 'custom';

-- Step 3: We can't remove 'custom' from enum directly, but it won't be used anymore
-- If you want to fully remove it, you'd need to recreate the enum (complex operation)
-- For now, 'custom' remains in the enum but won't be used

COMMIT;
