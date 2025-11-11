-- ============================================
-- RUN THIS AFTER APPLYING THE TRIGGERS
-- ============================================
-- This syncs any existing auth.users to public.users
-- Only needed if you already created users before applying triggers
-- ============================================

-- Sync all existing auth users to public.users table
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.created_at,
  now()
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- Verify the sync
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC;

-- Check counts match
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as public_users_count;
