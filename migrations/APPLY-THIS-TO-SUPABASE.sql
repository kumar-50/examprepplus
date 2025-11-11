-- ============================================
-- APPLY THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This links Supabase auth.users to your public.users table
-- Run this ONCE in Supabase Dashboard > SQL Editor > New Query
-- ============================================

-- 1. Function to create user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger that fires when new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Function to update last login
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_login_at = now()
  WHERE id = new.user_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for login tracking
DROP TRIGGER IF EXISTS on_user_login ON auth.sessions;
CREATE TRIGGER on_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if triggers were created
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_user_login');

-- Check if functions were created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'handle_user_login')
  AND routine_schema = 'public';
