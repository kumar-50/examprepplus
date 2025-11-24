-- Migration: Add 'monthly' to goal_type enum
-- Date: 2025-11-23
-- Description: Add 'monthly' to goal_type enum

-- Add 'monthly' value to the enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'monthly' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'goal_type')
    ) THEN
        ALTER TYPE goal_type ADD VALUE 'monthly';
    END IF;
END $$;

-- Note: We keep 'custom' in the enum for backward compatibility
-- Removing enum values requires recreating the entire enum which is complex
-- The UI will only use 'daily', 'weekly', 'monthly' going forward
