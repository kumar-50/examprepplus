# 🛠️ Development Setup Checklist

Complete step-by-step guide for setting up ExamPrepPlus in your local development environment.

---

## Prerequisites

### ☐ 1. Required Software

Install these before starting:

- [ ] **Node.js** (v18 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version`

- [ ] **npm** (comes with Node.js)
  - Verify: `npm --version`

- [ ] **Git** (optional but recommended)
  - Download: https://git-scm.com/
  - Verify: `git --version`

- [ ] **Code Editor** (VS Code recommended)
  - Download: https://code.visualstudio.com/

---

## Supabase Setup

### ☐ 2. Create Supabase Project

1. Go to https://supabase.com/
2. Sign up or log in
3. Click **"New Project"**
4. Enter:
   - **Name**: ExamPrepPlus-Dev
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Wait for project to initialize (~2 minutes)

### ☐ 3. Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy and save:
   - **Project URL**: `https://[project-id].supabase.co`
   - **anon public** key (under "Project API keys")
3. Go to **Settings** → **Database**
4. Copy **Connection string** → **URI** (Direct connection)
   - Should look like: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

---

## Project Setup

### ☐ 4. Clone or Download Project

```bash
# If using Git
git clone [your-repo-url]
cd examprepplus

# Or download ZIP and extract
```

### ☐ 5. Install Dependencies

```bash
npm install
```

**Expected output**: No errors, ~1-2 minutes

### ☐ 6. Create Environment File

1. Copy the example file:

```bash
# Windows (PowerShell)
Copy-Item .env.local.example .env.local

# Mac/Linux
cp .env.local.example .env.local
```

2. If `.env.local.example` doesn't exist, create `.env.local`:

```bash
# Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# Mac/Linux
touch .env.local
```

### ☐ 7. Configure Environment Variables

Open `.env.local` and add your Supabase credentials from step 3:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Connection (use direct connection, port 5432)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

**Important**: 
- Replace `[your-project-id]` with your actual project ID
- Replace `[password]` with your database password
- Use port **5432** (direct), not 6543 (pooler)

---

## Database Setup

### ☐ 8. Run Migrations

```bash
npm run migrate
```

**Expected output**:
```
🔄 Connecting to database...
🚀 Running migrations...
✅ Migrations completed successfully!
👋 Database connection closed
```

**If errors occur**:
- Check `DATABASE_URL` is correct in `.env.local`
- Verify database password
- Ensure using port 5432 (not 6543)

### ☐ 9. Verify Database Tables

1. Go to Supabase Dashboard → **Table Editor**
2. Should see these tables:
   - users
   - questions
   - topics
   - sections
   - tests
   - test_questions
   - user_test_attempts
   - user_answers
   - subscriptions
   - subscription_plans
   - coupons
   - coupon_usage

### ☐ 10. Verify Auth Triggers

Run in Supabase → **SQL Editor**:

```sql
-- Check triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_user_login');
```

**Expected result**:
```
trigger_name          | event_object_table
----------------------|-------------------
on_auth_user_created  | users
on_user_login         | sessions
```

---

## Authentication Setup

### ☐ 11. Disable Email Confirmation (Development Only)

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Scroll to **"Confirm email"**
3. **Uncheck** "Enable email confirmations" ❌
4. Click **Save**

**Why?** Makes testing faster in development. We'll enable this in production.

### ☐ 12. Configure Local Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/**
   http://127.0.0.1:3000/**
   ```
3. Set **Site URL**: `http://localhost:3000`
4. Click **Save**

---

## Development Server

### ☐ 13. Start Development Server

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
- Ready in 2.3s
```

### ☐ 14. Open in Browser

1. Open http://localhost:3000
2. Should see ExamPrepPlus landing page
3. No console errors (check browser DevTools)

---

## Test Authentication

### ☐ 15. Test Sign Up

1. Click **"Sign Up"** in header
2. Fill in form:
   - **Full Name**: Test User
   - **Email**: test@example.com
   - **Password**: password123
   - **Confirm Password**: password123
3. Click **"Sign Up"**
4. Should redirect to home page
5. Should see avatar with initials "TU" in header

### ☐ 16. Verify User in Database

Go to Supabase → **SQL Editor**:

```sql
-- Check user in auth.users
SELECT id, email, created_at FROM auth.users;

-- Check user in public.users
SELECT id, email, full_name, role FROM users;

-- Verify same ID in both tables
SELECT 
  au.id as auth_id,
  u.id as public_id,
  au.email
FROM auth.users au
JOIN public.users u ON au.id = u.id;
```

All queries should return your test user!

### ☐ 17. Test Sign Out

1. Click avatar in header
2. Click **"Sign out"**
3. Should redirect to home page
4. Should see "Sign In" and "Sign Up" buttons again

### ☐ 18. Test Sign In

1. Click **"Sign In"**
2. Enter credentials:
   - **Email**: test@example.com
   - **Password**: password123
3. Click **"Sign In"**
4. Should redirect to home page
5. Avatar should appear again

---

## Test Admin Access

### ☐ 19. Create Admin User

Run in Supabase → **SQL Editor**:

```sql
-- Make your test user an admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'test@example.com';

-- Verify
SELECT email, role FROM users WHERE role = 'admin';
```

### ☐ 20. Test Admin Route

1. Make sure you're signed in as the admin user
2. Navigate to http://localhost:3000/admin
3. Should see **"Admin Dashboard"**
4. Should show your email and role as "admin"

### ☐ 21. Test Admin Protection

1. Click avatar → Sign out
2. Try to access http://localhost:3000/admin
3. Should redirect to `/login?redirect=/admin`
4. Sign in as regular user (create another account)
5. Try to access `/admin` again
6. Should still be blocked (not admin role)

---

## Code Quality Checks

### ☐ 22. Run Type Checking

```bash
npm run typecheck
```

**Expected**: "No errors found"

### ☐ 23. Run Linting

```bash
npm run lint
```

**Expected**: "No lint errors" or minor warnings only

### ☐ 24. Check Build

```bash
npm run build
```

**Expected**: Successful build with no errors

---

## Development Tools

### ☐ 25. Set Up Drizzle Studio (Optional)

```bash
npm run db:studio
```

Opens a visual database browser at http://localhost:4983

### ☐ 26. Install VS Code Extensions (Recommended)

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Prettier - Code formatter**
- **ESLint**
- **Pretty TypeScript Errors**

---

## Common Development Tasks

### View Database in Browser

```bash
npm run db:studio
```

### Generate New Migration

```bash
npm run db:generate
```

### Push Schema Changes

```bash
npm run db:push
```

### Format Code

```bash
npm run format
```

### Run Quality Checks

```bash
npm run quality
```

---

## Troubleshooting

### ❌ "Missing Supabase environment variables"

**Fix**: Check `.env.local` exists and has correct variables

### ❌ Migration fails

**Fix**: 
- Verify `DATABASE_URL` is correct
- Use direct connection (port 5432)
- Check database password

### ❌ "Email not confirmed" error when signing in

**Fix**: Disable email confirmation (step 11)

### ❌ Can't access /admin even as admin

**Fix**: 
- Clear browser cookies/localStorage
- Sign out and sign in again
- Verify role in database: `SELECT role FROM users WHERE email = 'your@email.com'`

### ❌ Server won't start

**Fix**:
- Kill any process using port 3000
- Windows: `netstat -ano | findstr :3000` then `taskkill /PID [number] /F`
- Mac/Linux: `lsof -ti:3000 | xargs kill`

### ❌ Build errors

**Fix**:
- Delete `.next` folder
- Delete `node_modules` folder
- Run `npm install` again
- Run `npm run build`

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Check code quality
npm run typecheck        # Check TypeScript
npm run format           # Format code with Prettier

# Database
npm run migrate          # Run migrations
npm run db:generate      # Generate new migration
npm run db:push          # Push schema changes
npm run db:studio        # Open database browser

# Quality
npm run quality          # Run lint + typecheck + format check
```

---

## Development Workflow

### Daily Workflow

1. Start dev server: `npm run dev`
2. Make changes to code
3. Test in browser (auto-reloads)
4. Check for errors in terminal and browser console
5. Commit changes to Git

### Before Committing

```bash
# Run quality checks
npm run quality

# Fix any issues
npm run format

# Commit
git add .
git commit -m "Your message"
git push
```

### Testing New Features

1. Create test account
2. Test all user flows
3. Test error cases
4. Test on mobile (Chrome DevTools)
5. Check browser console for errors

---

## Database Management

### View All Users

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  subscription_status,
  created_at
FROM users
ORDER BY created_at DESC;
```

### Make User Admin

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

### Reset User Password (via Supabase)

1. Supabase Dashboard → **Authentication** → **Users**
2. Find user → Click **...** → **Reset Password**
3. User receives reset email

### Delete Test User

```sql
-- Delete from public.users
DELETE FROM users WHERE email = 'test@example.com';

-- Then delete from auth.users in Supabase Dashboard
-- Authentication → Users → Find user → Delete
```

---

## Environment Setup Complete! ✅

You should now have:
- ✅ Node.js and dependencies installed
- ✅ Supabase project created
- ✅ Database tables created via migrations
- ✅ Auth triggers set up
- ✅ Development server running
- ✅ Authentication working
- ✅ Admin access configured
- ✅ Development tools ready

---

## Next Steps

1. **Explore the codebase**:
   - `src/app/` - Pages and routes
   - `src/components/` - Reusable components
   - `src/hooks/` - Custom React hooks
   - `src/lib/` - Utilities and helpers
   - `src/db/schema/` - Database schema

2. **Start building features**:
   - Review `docs/tasks/` for upcoming features
   - Follow task files in order (08, 09, 10, etc.)
   - Test each feature thoroughly

3. **Join the development process**:
   - Review open issues
   - Create feature branches
   - Submit pull requests
   - Write tests

---

## Support Resources

- **Documentation**: `docs/` folder
- **Task Guides**: `docs/tasks/`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Drizzle ORM Docs**: https://orm.drizzle.team/

---

**Estimated Setup Time**: 30-45 minutes

**Last Updated**: November 9, 2025

---

## 🎉 Happy Coding!

Your development environment is ready. Start building amazing features for ExamPrepPlus!
