-- Migration: Update test types from ['mock', 'live', 'sectional', 'practice'] to ['mock-test', 'sectional', 'practice']
-- Date: 2025-11-24

-- Step 1: Update existing data to new values
UPDATE tests 
SET test_type = 'mock-test'
WHERE test_type IN ('mock', 'live');

-- Step 2: Drop the old enum type and create new one
-- First, alter the column to use varchar temporarily
ALTER TABLE tests 
ALTER COLUMN test_type TYPE varchar(20);

-- Drop the old enum
DROP TYPE IF EXISTS test_type CASCADE;

-- Create the new enum with updated values
CREATE TYPE test_type AS ENUM('mock-test', 'sectional', 'practice');

-- Step 3: Convert the column back to use the new enum
ALTER TABLE tests 
ALTER COLUMN test_type TYPE test_type USING test_type::test_type;

-- Verification query
SELECT test_type, COUNT(*) as count
FROM tests
GROUP BY test_type
ORDER BY test_type;
