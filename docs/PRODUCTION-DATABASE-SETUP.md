# 🚀 Production Database Setup - Universal Migration Guide

## Overview

This is a **ONE-TIME, UNIVERSAL setup** that works for:
- ✅ Development environment
- ✅ Staging environment  
- ✅ Production environment
- ✅ Any new deployment

## How It Works

The auth triggers are now part of your **Drizzle migrations**, so they're version-controlled and automatically applied.

```
Your App Deployment
    ↓
Run migrations (npm run migrate:prod)
    ↓
Drizzle applies all migrations in order:
  - 0000_green_blink.sql (creates tables)
  - 0001_auth_triggers.sql (creates triggers)
    ↓
✅ Database is ready with auth sync!
```

## 🎯 For Production (Vercel, Railway, etc.)

### Option 1: Automatic on Build (Recommended)

Update your build command in your hosting platform:

**Vercel:**
```json
// vercel.json or project settings
{
  "buildCommand": "npm run migrate:prod && npm run build"
}
```

**Railway:**
```
Build Command: npm run migrate:prod && npm run build
```

**Render:**
```
Build Command: npm install && npm run migrate:prod && npm run build
```

### Option 2: Manual One-Time Setup

Run this ONCE when deploying to production:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run migrate:prod
```

### Option 3: Via Supabase Dashboard (If you prefer)

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `drizzle/0001_auth_triggers.sql`
3. Paste and click **RUN**
4. Done! (But Option 1 or 2 is better for consistency)

## 🔧 For Local Development

### First Time Setup

```bash
# 1. Make sure you have .env.local with DATABASE_URL
# 2. Run migrations
npm run migrate

# That's it! Triggers are now installed.
```

### For New Team Members

When someone clones the repo:

```bash
# 1. Copy .env.local.example to .env.local
# 2. Add their DATABASE_URL
# 3. Run migrations
npm run migrate

# Done! They have the same setup as you.
```

## 📦 What Gets Deployed

Your migrations are in version control:

```
drizzle/
  ├── 0000_green_blink.sql       # Creates all tables
  ├── 0001_auth_triggers.sql     # Creates auth sync triggers ← NEW!
  └── meta/
      ├── _journal.json          # Migration history
      ├── 0000_snapshot.json
      └── 0001_snapshot.json
```

Every environment that runs `npm run migrate:prod` gets the **exact same setup**.

## ✅ Verification

After running migrations, verify triggers exist:

```bash
# Option A: Via npm script (create this if needed)
npm run db:studio

# Option B: Via SQL
# Run this in Supabase SQL Editor or any Postgres client:
```

```sql
-- Check triggers exist
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_user_login');

-- Should return:
-- on_auth_user_created | users    | AFTER
-- on_user_login        | sessions | AFTER
```

## 🔄 Migration Flow

### Development → Production

```mermaid
Developer
  ↓ (creates schema change)
npm run db:generate
  ↓ (creates new migration file)
git commit & push
  ↓
CI/CD Pipeline
  ↓
npm run migrate:prod
  ↓
Production Database Updated ✅
```

### What Happens on Each Deploy

```bash
# Your deployment script (e.g., on Vercel)
1. Pull latest code
2. npm install
3. npm run migrate:prod  ← Applies any new migrations
4. npm run build
5. npm run start
```

Drizzle is **idempotent** - it only applies migrations that haven't been run yet.

## 🎓 Understanding the Files

### Migration File (`drizzle/0001_auth_triggers.sql`)

```sql
-- This runs ONCE per database
-- Safe to run multiple times (has DROP IF EXISTS)

CREATE OR REPLACE FUNCTION handle_new_user() ...
CREATE TRIGGER on_auth_user_created ...
```

**Key Features:**
- ✅ `CREATE OR REPLACE` - Safe to re-run
- ✅ `DROP TRIGGER IF EXISTS` - Won't error if already exists
- ✅ `SECURITY DEFINER` - Runs with elevated privileges
- ✅ `ON CONFLICT DO NOTHING` - Won't duplicate users

### Migration Script (`src/scripts/migrate.ts`)

```typescript
// Reads all .sql files in drizzle/
// Applies them in order
// Tracks which ones have been applied
// Skips already-applied migrations
```

## 🌍 Multi-Environment Setup

### Recommended Environment Variables

```bash
# .env.local (development)
DATABASE_URL=postgresql://localhost:5432/dev_db

# .env.staging (staging)
DATABASE_URL=postgresql://staging.supabase.co:5432/...

# .env.production (production) - Set in hosting platform
DATABASE_URL=postgresql://prod.supabase.co:5432/...
```

### Run Migrations Per Environment

```bash
# Development
npm run migrate

# Staging
DATABASE_URL=staging-url npm run migrate:prod

# Production
DATABASE_URL=production-url npm run migrate:prod
```

## 🚨 Important Notes

### For Supabase Projects

**Connection Pooling:**
```bash
# Use direct connection for migrations (not pooler)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# NOT the pooler URL (ends in :6543)
```

**Supabase Auth Schema:**
The triggers reference `auth.users` and `auth.sessions` which are Supabase's internal tables. This will work on any Supabase project.

### Migration State Tracking

Drizzle uses a `__drizzle_migrations` table to track applied migrations:

```sql
-- Check migration history
SELECT * FROM __drizzle_migrations ORDER BY created_at DESC;
```

## 📋 Deployment Checklist

For each new environment:

- [ ] Set `DATABASE_URL` environment variable
- [ ] Run `npm run migrate:prod` (or include in build command)
- [ ] Verify triggers exist (run verification query)
- [ ] Test: Sign up new user
- [ ] Verify user appears in both `auth.users` and `public.users`
- [ ] Create admin user (run UPDATE query)
- [ ] Test admin access

## 🔐 Security Best Practices

### CI/CD Pipeline

```yaml
# Example GitHub Actions
- name: Run Database Migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: npm run migrate:prod

# Migrations run in CI before deployment
# Ensures database is ready before new code deploys
```

### Rollback Strategy

If you need to rollback a migration:

```sql
-- Manual rollback of auth triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_login ON auth.sessions;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_user_login();
```

Better approach: Create a new migration file that removes them.

## 📚 Additional Resources

**Drizzle Migrations Docs:**
https://orm.drizzle.team/docs/migrations

**Supabase Auth Triggers:**
https://supabase.com/docs/guides/auth/managing-user-data#using-triggers

**Database Migration Best Practices:**
- Always test in development first
- Never edit old migration files
- Create new migrations for changes
- Keep migrations small and focused
- Include rollback strategy

## ❓ FAQ

**Q: Do I need to run migrations on every deploy?**
A: Yes, but it's safe. Drizzle only applies new migrations.

**Q: What if migration fails mid-deploy?**
A: Drizzle uses transactions. If it fails, nothing is applied.

**Q: Can I have different triggers in dev vs prod?**
A: Not recommended. Keep environments identical using migrations.

**Q: What about existing users?**
A: Run the sync script once (see next section).

## 🔄 One-Time: Sync Existing Users

If you have existing auth users BEFORE applying triggers:

```sql
-- Run this ONCE in production after applying triggers
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

Save this as `drizzle/0002_sync_existing_users.sql` if needed as a migration.

---

## ✅ You're Done!

With this setup:
- ✅ Migrations are version-controlled
- ✅ Work identically in all environments
- ✅ New team members get same setup
- ✅ Production deploys are automated
- ✅ No manual SQL needed
- ✅ Rollback is possible
- ✅ Audit trail of all changes

**Next time you add a feature:**
1. Update Drizzle schema
2. Run `npm run db:generate`
3. Commit the new migration file
4. Deploy - migration runs automatically!
