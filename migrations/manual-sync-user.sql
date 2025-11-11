-- Manually sync user from auth.users to public.users
-- Run this in Supabase SQL Editor

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
  '014dbbc4-ab8f-4a2a-958e-544a02ca28ee',
  'muthu08612@gmail.com',
  'admin',
  'user',
  'free',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Verify the user was created
SELECT id, email, full_name, role, subscription_status, is_active
FROM public.users
WHERE email = 'muthu08612@gmail.com';
