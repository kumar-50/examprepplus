-- Fix user ID mismatch - sync auth.users ID to public.users
-- Run this in Supabase SQL Editor

-- Delete the old record with wrong ID
DELETE FROM public.users WHERE email = 'muthu08612@gmail.com';

-- Insert with correct ID from auth.users
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
  '014dbbc4-ab8f-4a2a-958e-544a02ca28ee',  -- Correct ID from auth.users
  'muthu08612@gmail.com',
  'admin',
  'admin',  -- Making you admin directly
  'free',
  true,
  NOW(),
  NOW()
);

-- Verify the fix
SELECT id, email, full_name, role 
FROM public.users 
WHERE email = 'muthu08612@gmail.com';
