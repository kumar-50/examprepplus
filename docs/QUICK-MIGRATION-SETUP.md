# Quick Setup - Run Migrations Now

## For Your Current Development Setup

Run this command to apply all migrations including auth triggers:

```bash
npm run migrate
```

This will:
1. ✅ Connect to your database using `DATABASE_URL` from `.env.local`
2. ✅ Apply the auth triggers migration
3. ✅ Set up automatic user sync

## Verify It Worked

```bash
# Option 1: Check in code (create a test file)
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  return client.query(\`
    SELECT trigger_name FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  \`);
}).then(res => {
  console.log(res.rows.length > 0 ? '✅ Triggers installed!' : '❌ No triggers found');
  client.end();
});
"

# Option 2: Check in Supabase Dashboard
# Go to SQL Editor and run:
# SELECT trigger_name FROM information_schema.triggers 
# WHERE trigger_name IN ('on_auth_user_created', 'on_user_login');
```

## If You Already Have Users

Sync them to the users table:

```bash
# Create a quick sync script or run in Supabase SQL Editor:
```

```sql
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.created_at,
  now()
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- Check it worked:
SELECT COUNT(*) FROM public.users;
```

## Test It

1. Sign up a NEW user in your app
2. Check both tables:

```sql
-- Should see user in BOTH tables with same ID
SELECT 'auth.users' as source, id::text, email FROM auth.users WHERE email = 'test@example.com'
UNION ALL
SELECT 'public.users' as source, id::text, email FROM public.users WHERE email = 'test@example.com';
```

## That's It!

From now on:
- ✅ New signups automatically create user in both tables
- ✅ Logins update last_login_at timestamp
- ✅ No manual work needed
- ✅ Works in all environments
