-- =================================================================
-- TRIGGERS ONLY - Apply this in Supabase SQL Editor
-- =================================================================
-- Use this when your tables already exist and you just need triggers
-- Safe to run multiple times (has IF EXISTS checks)
-- =================================================================

-- Function: Sync new auth users to public.users
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
    created_at, 
    updated_at
  )
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
$$;

-- Trigger: Fire on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Function: Track user logins
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

-- Trigger: Fire on auth.sessions insert
DROP TRIGGER IF EXISTS on_user_login ON auth.sessions;
CREATE TRIGGER on_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_user_login();

-- =================================================================
-- VERIFY INSTALLATION
-- =================================================================
SELECT 
  trigger_name, 
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_user_login')
ORDER BY trigger_name;

-- Expected output:
-- on_auth_user_created | users    | AFTER | INSERT
-- on_user_login        | sessions | AFTER | INSERT
