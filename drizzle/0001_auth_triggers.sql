-- ============================================
-- Auth Triggers Migration (Idempotent)
-- ============================================
-- This migration is safe to run multiple times
-- It will only create what doesn't exist
-- ============================================

-- 1. Create function to sync new auth users to public.users
-- Using CREATE OR REPLACE makes this idempotent
-- Includes all required NOT NULL fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
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
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user',  -- Default role
    'free',  -- Default subscription
    true,    -- Active by default
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
  
  RETURN new;
END;
$$;

-- 2. Create trigger on auth.users insert
-- Using DROP IF EXISTS makes this idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Create function to track user logins
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.users
  SET 
    last_login_at = now(),
    updated_at = now()
  WHERE id = new.user_id;
  
  RETURN new;
END;
$$;

-- 4. Create trigger on auth.sessions insert
DROP TRIGGER IF EXISTS on_user_login ON auth.sessions;
CREATE TRIGGER on_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_user_login();

-- ============================================
-- VERIFICATION (Optional - comment out for actual migration)
-- ============================================
-- Uncomment to verify triggers were created:
-- SELECT trigger_name, event_object_table, action_timing, event_manipulation
-- FROM information_schema.triggers 
-- WHERE trigger_name IN ('on_auth_user_created', 'on_user_login')
-- ORDER BY trigger_name;
