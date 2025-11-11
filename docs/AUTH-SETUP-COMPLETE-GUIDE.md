# 🔗 Auth Database Setup - Complete Guide

## TL;DR - Quick Start

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Run migrations to set up auth triggers
npm run migrate

# 3. If you have existing users, sync them (run in Supabase SQL Editor)
# See "Sync Existing Users" section below
```

That's it! Auth triggers are now set up universally.

---

## What Problem Does This Solve?

**The Issue:**
- When users sign up via Supabase Auth, they're added to `auth.users` (Supabase's table)
- Your app needs user data in `public.users` (your custom table with roles, subscriptions, etc.)
- Without a link, these two tables don't sync!

**The Solution:**
- Database triggers automatically sync `auth.users` → `public.users`
- Uses the same `id` (UUID) in both tables
- Works universally in development, staging, and production

---

## How It Works

### The Magic Flow

```
1. User signs up
   ↓
2. Supabase creates record in auth.users
   ↓
3. 🔥 TRIGGER fires: "on_auth_user_created"
   ↓
4. 📝 Function runs: handle_new_user()
   ↓
5. ✅ Record created in public.users with SAME ID
```

### The Link

```typescript
auth.users {                  public.users {
  id: "abc-123",     ←────→    id: "abc-123",        // SAME ID!
  email: "user@test.com"       email: "user@test.com"
}                              role: "user",
                               subscription_status: "free"
                            }
```

### Your Code Uses Both

```typescript
// Server-side (for admin checks)
const user = await getCurrentUser()              // From auth.users
const profile = await getUserProfile(user.id)    // From public.users (using same ID)
if (profile.role === 'admin') { /* ... */ }

// Client-side (for display)
const { user } = useSessionUser()  // From Supabase auth (auth.users)
// user.id, user.email, user.user_metadata
```

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This installs `tsx` (TypeScript executor) and other dependencies needed for migrations.

### Step 2: Run Migrations

```bash
# For development (uses .env.local)
npm run migrate

# For production (uses environment DATABASE_URL)
npm run migrate:prod
```

**What happens:**
- ✅ Connects to your database
- ✅ Creates `handle_new_user()` function
- ✅ Creates `on_auth_user_created` trigger
- ✅ Creates `handle_user_login()` function  
- ✅ Creates `on_user_login` trigger

### Step 3: Sync Existing Users (If Any)

If you already have users in `auth.users` before running migrations:

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

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
```

**Option B: Create a Migration** (recommended for production)

Create `drizzle/0002_sync_existing_users.sql`:
```sql
-- One-time sync of existing users
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.created_at,
  now()
FROM auth.users au
ON CONFLICT (id) DO NOTHING;
```

Then run `npm run migrate` again.

---

## ✅ Verify Setup

### Check Triggers Exist

Run in Supabase SQL Editor:

```sql
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_user_login');
```

**Expected output:**
```
trigger_name         | event_object_table | action_timing
---------------------|--------------------|---------------
on_auth_user_created | users              | AFTER
on_user_login        | sessions           | AFTER
```

### Check User Counts Match

```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users;
```

Both numbers should be equal!

### Test New User Signup

1. Sign up with a new email in your app
2. Check both tables:

```sql
SELECT 'auth.users' as source, id::text, email, created_at 
FROM auth.users 
WHERE email = 'your-test@email.com'
UNION ALL
SELECT 'public.users' as source, id::text, email, created_at 
FROM public.users 
WHERE email = 'your-test@email.com';
```

Should see **2 rows** with the **same ID**!

---

## 🌍 Production Deployment

### For Vercel / Railway / Render

**Method 1: Include in Build Command (Recommended)**

```bash
# Vercel build command:
npm run migrate:prod && npm run build

# Railway:
npm install && npm run migrate:prod && npm run build

# Render:
npm run migrate:prod && npm run build
```

**Method 2: Separate Deployment Script**

```bash
# deploy.sh
#!/bin/bash
echo "Running database migrations..."
npm run migrate:prod
echo "Building application..."
npm run build
echo "Deployment ready!"
```

### Environment Variables

Set in your hosting platform:

```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important:** Use the **direct** database URL, not the connection pooler URL (port 5432, not 6543).

### First Production Deploy

```bash
# 1. Set environment variables in hosting platform
# 2. Deploy code (includes migrations in build command)
# 3. Verify triggers (run SQL check in Supabase)
# 4. Create admin user:
UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
# 5. Test signup + admin access
```

---

## 📁 Files Created

```
drizzle/
  ├── 0000_green_blink.sql          # Your existing schema
  ├── 0001_auth_triggers.sql        # Auth sync triggers ✨ NEW
  └── meta/
      ├── _journal.json             # Updated with new migration
      └── 0001_snapshot.json        # New migration metadata

src/scripts/
  └── migrate.ts                    # Migration runner script

docs/
  ├── AUTH-DATABASE-SETUP.md        # Detailed technical guide
  ├── PRODUCTION-DATABASE-SETUP.md  # Production deployment guide
  └── QUICK-MIGRATION-SETUP.md      # Quick reference

migrations/
  ├── APPLY-THIS-TO-SUPABASE.sql   # Manual SQL (if needed)
  └── sync-existing-users.sql      # One-time sync script
```

---

## 🔧 Troubleshooting

### "Migration failed: relation auth.users does not exist"

**Cause:** Not connected to Supabase database or wrong credentials.

**Fix:** 
1. Verify `DATABASE_URL` in `.env.local`
2. Test connection: `psql $DATABASE_URL` (if you have psql)
3. Check Supabase project is running

### "Users still not syncing"

**Cause:** Triggers not applied or failed silently.

**Fix:**
1. Run verification query (see "Verify Setup" section)
2. Check Supabase logs for errors
3. Manually apply SQL from `drizzle/0001_auth_triggers.sql` in Supabase SQL Editor

### "ON CONFLICT (id) error"

**Cause:** User ID already exists in `public.users`.

**Fix:** This is normal! The `ON CONFLICT DO NOTHING` clause handles it gracefully.

### "Permission denied for schema auth"

**Cause:** Using wrong database role or credentials.

**Fix:** 
1. Use the `postgres` role (admin) for migrations
2. Check you're using the direct connection URL from Supabase settings
3. Ensure `SECURITY DEFINER` is in the function definitions

---

## 🎓 Understanding the Code

### The Trigger Function

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- NEW is the row being inserted into auth.users
  INSERT INTO public.users (
    id,          -- Use same ID from auth.users
    email,       -- Copy email
    full_name,   -- Extract from metadata
    created_at,
    updated_at
  )
  VALUES (
    new.id,     -- Same UUID!
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;  -- Skip if already exists
  
  RETURN new;  -- Continue with auth.users insert
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Key parts:**
- `TRIGGER` - Fires automatically on database events
- `SECURITY DEFINER` - Runs with elevated permissions
- `new.id` - The ID being inserted into `auth.users`
- `ON CONFLICT DO NOTHING` - Idempotent (safe to run multiple times)

### The Trigger Declaration

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users        -- After a row is inserted into auth.users
  FOR EACH ROW                      -- Run once per inserted row
  EXECUTE FUNCTION handle_new_user();  -- Run this function
```

---

## 🎯 Benefits of This Approach

### ✅ Universal

- Works in development, staging, production
- Same setup for all team members
- No manual steps per environment

### ✅ Automatic

- New signups automatically sync
- No code changes needed
- No cron jobs or background workers

### ✅ Version Controlled

- Migrations tracked in Git
- Can review changes in PRs
- Easy rollback if needed

### ✅ Consistent

- Same ID in both tables (guaranteed)
- Atomic operations (transaction-safe)
- No race conditions

### ✅ Maintainable

- Clear migration history
- Easy to debug (check trigger in Supabase)
- Self-documenting

---

## 📚 Next Steps

After setup is complete:

1. ✅ Test signup flow
2. ✅ Create admin user
3. ✅ Test admin route protection (`/admin`)
4. ✅ Deploy to production
5. 📋 Move to Task 08: Admin CRUD UI

---

## ❓ FAQ

**Q: Do I need to run migrations on every deploy?**
**A:** Yes, but it's safe. The migration system only applies new migrations.

**Q: What if I need to change the trigger logic?**
**A:** Create a new migration file with `CREATE OR REPLACE FUNCTION`. Don't edit old migrations.

**Q: Can I see which migrations have been applied?**
**A:** Yes! Query the `__drizzle_migrations` table:
```sql
SELECT * FROM __drizzle_migrations ORDER BY created_at DESC;
```

**Q: What happens if a user is deleted from auth.users?**
**A:** Currently nothing. You may want to add a trigger for `ON DELETE` to soft-delete in `public.users`.

**Q: Do triggers slow down signups?**
**A:** No, they add ~1-2ms. It's a simple INSERT operation.

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify environment variables are correct
3. Run verification queries
4. Check Supabase logs (Supabase Dashboard → Logs)
5. Review migration files in `drizzle/` directory

---

**You're all set!** 🎉

Your auth system now automatically syncs users across Supabase Auth and your custom database tables, universally across all environments.
