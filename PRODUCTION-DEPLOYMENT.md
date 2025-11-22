# Production Deployment Checklist

**Project:** ExamPrepPlus  
**Date:** November 22, 2025  
**Environment:** Supabase + Vercel/Next.js

---

## 📋 Pre-Deployment Checklist

### 1. Database Migrations (Production Supabase)

#### ✅ Already Applied (Development)
- Base tables (users, questions, tests, etc.)
- Practice mode tables (weak_topics, revision_schedule)
- Streak tracking tables (practice_streaks, practice_calendar)

#### 🚀 For Production Database

**Option A: Using SQL Editor (Recommended for first deployment)**

1. **Login to Production Supabase:**
   - Go to: https://app.supabase.com/project/[YOUR_PROD_PROJECT_ID]/sql

2. **Apply Migrations in Order:**

   **Step 1: Base Schema**
   ```bash
   # Copy and run: drizzle/0000_green_blink.sql
   # This creates all core tables
   ```

   **Step 2: Auth Triggers**
   ```bash
   # Run: drizzle/0001_auth_triggers.sql
   # Run: drizzle/0002_fix_auth_trigger.sql
   ```

   **Step 3: Question Verification**
   ```bash
   # Run: drizzle/0003_add_question_verification.sql
   # Run: drizzle/0006_remove_draft_status.sql
   ```

   **Step 4: Test Fields**
   ```bash
   # Run: drizzle/0007_add_test_fields.sql
   ```

   **Step 5: Practice Mode**
   ```bash
   # Run: migrations/add-practice-mode-tables.sql
   ```

   **Step 6: Streak Tracking**
   ```bash
   # Run: migrations/add-practice-streaks.sql
   ```

**Option B: Using Drizzle Push (Fast but risky)**
```bash
# Set production DATABASE_URL in .env.production
npm run db:push -- --config=drizzle.config.prod.ts
```

---

### 2. Environment Variables

Create `.env.production` or set in Vercel:

```bash
# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================

# Database (Production Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App URL (Your production domain)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Node Environment
NODE_ENV="production"
```

**⚠️ Important Notes:**
- Use **connection pooler** URL (port 6543) for serverless (Vercel)
- Use **direct connection** URL (port 5432) only for migrations
- Never commit `.env.production` to git

---

### 3. Vercel Deployment Setup

#### Step 1: Connect Repository
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link project
vercel link
```

#### Step 2: Configure Environment Variables
```bash
# Add all environment variables
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Or add them in Vercel Dashboard:
- Go to: https://vercel.com/[your-team]/examprepplus/settings/environment-variables

#### Step 3: Build Settings (Vercel Dashboard)
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x or 20.x

---

### 4. Pre-Deployment Tests

Run these locally before deploying:

```bash
# 1. Production build test
npm run build

# 2. Type checking
npm run type-check  # or: npx tsc --noEmit

# 3. Linting
npm run lint

# 4. Check for errors
npm run build && npm run start
```

---

### 5. Database Backup (Before Migration)

**In Supabase Dashboard:**
1. Go to: Database → Backups
2. Create manual backup before applying migrations
3. Name it: "Pre-streak-feature-backup-[DATE]"

---

### 6. Supabase Production Settings

#### Enable Row Level Security (RLS)
```sql
-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- If any show 'f', enable RLS:
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

#### Check Auth Settings
- Email confirmation: Enable/Disable as needed
- JWT expiry: Set appropriate timeout
- Site URL: Update to production domain

---

### 7. Post-Deployment Verification

After deploying, test these:

#### Database Check
```sql
-- Run in production Supabase SQL Editor
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 17 tables

-- Check practice tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'weak_topics', 
  'revision_schedule',
  'practice_streaks', 
  'practice_calendar'
);
-- Expected: 4 rows
```

#### App Health Checks
- [ ] Login/Signup works
- [ ] Practice mode loads
- [ ] Weak topics display
- [ ] Streak tracking updates
- [ ] Questions load properly
- [ ] Test taking works
- [ ] User dashboard accessible

---

## 🚀 Deployment Commands

### Option 1: Deploy via Vercel Dashboard
1. Push code to GitHub
2. Vercel auto-deploys on push to main

### Option 2: Deploy via CLI
```bash
# Deploy to production
vercel --prod

# Or deploy preview
vercel
```

### Option 3: Manual Git Push
```bash
git add .
git commit -m "feat: add streak tracking feature"
git push origin main
```

---

## 🔄 Migration Strategy (Production)

### Recommended Approach:

1. **Create Production Supabase Project** (if not exists)
2. **Apply all migrations** via SQL Editor
3. **Verify with test queries**
4. **Update Vercel environment variables**
5. **Deploy to Vercel**
6. **Test production site**

### Rollback Plan:

If something goes wrong:
```sql
-- Drop new tables (if needed)
DROP TABLE IF EXISTS practice_calendar CASCADE;
DROP TABLE IF EXISTS practice_streaks CASCADE;

-- Restore from backup in Supabase Dashboard
```

---

## ⚠️ Production Gotchas

1. **Connection Pooler:** 
   - Use pooler URL (port 6543) in Vercel
   - Use direct URL (port 5432) for migrations

2. **CORS:**
   - Add production domain to Supabase allowed origins
   - Go to: Authentication → URL Configuration

3. **Rate Limits:**
   - Check Supabase plan limits
   - Consider upgrading for production traffic

4. **Caching:**
   - Set proper cache headers
   - Use ISR (Incremental Static Regeneration) where applicable

5. **Error Tracking:**
   - Consider adding Sentry or LogRocket
   - Monitor Vercel logs

---

## 📊 Performance Optimization

Before going live:

```bash
# Analyze bundle size
npm run build -- --profile

# Check for large dependencies
npx next-bundle-analyzer
```

Optimize:
- [ ] Enable Image Optimization
- [ ] Use Next.js Font Optimization
- [ ] Lazy load components
- [ ] Implement code splitting

---

## 🔒 Security Checklist

- [ ] All RLS policies tested
- [ ] Service role key secured (not in client code)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (using Drizzle ORM ✅)
- [ ] XSS protection enabled
- [ ] HTTPS enforced

---

## 📝 Deployment Steps Summary

```bash
# 1. Production database setup
# - Create project in Supabase
# - Apply all migrations via SQL Editor
# - Verify tables with verification queries

# 2. Configure Vercel
vercel link
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 3. Test build locally
npm run build
npm run start

# 4. Deploy
git push origin main
# or
vercel --prod

# 5. Verify production
# - Test all features
# - Check logs
# - Monitor performance
```

---

## 🆘 Troubleshooting

### "Can't connect to database"
- Check DATABASE_URL has correct pooler URL
- Verify Supabase project is running
- Check Vercel environment variables

### "RLS policy violation"
- Verify auth.uid() returns correct user
- Check policy conditions
- Test policies in Supabase SQL Editor

### "Build fails on Vercel"
- Check Node version compatibility
- Verify all dependencies installed
- Check build logs for specific errors

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs

---

## ✅ Final Pre-Launch Checklist

Before announcing to users:

- [ ] All migrations applied and verified
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring set up
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Test user accounts created
- [ ] All features tested in production
- [ ] Performance acceptable (< 3s load time)
- [ ] Mobile responsive tested
- [ ] SEO meta tags added
- [ ] Privacy policy/Terms added (if needed)

---

**Ready to deploy? Let me know if you need help with any specific step!** 🚀
