# 🚀 Production Deployment Checklist

Complete step-by-step guide for deploying ExamPrepPlus to production.

---

## Pre-Deployment Setup

### ☐ 1. Supabase Production Project

- [ ] Create a **new** Supabase project for production (don't use dev project)
- [ ] Note down:
  - Project URL: `https://[project-id].supabase.co`
  - Anon/Public Key
  - Database URL (direct connection, port 5432)

### ☐ 2. Environment Variables

Set these in your hosting platform (Vercel/Railway/Render):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Important: Use direct connection (port 5432), NOT pooler (port 6543)
```

---

## Database Setup

### ☐ 3. Run Migrations

**Option A: Automatic (Recommended)**

Set your build command to:
```bash
npm run migrate:prod && npm run build
```

This runs migrations automatically on every deploy.

**Option B: Manual First Time**

```bash
# Set DATABASE_URL first
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run migrate:prod
```

### ☐ 4. Verify Migrations

Run in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should see: users, questions, tests, subscriptions, etc.

-- Check triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_user_login');

-- Should see:
-- on_auth_user_created | users
-- on_user_login        | sessions
```

---

## Authentication Configuration

### ☐ 5. Enable Email Confirmation

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. **Enable** "Confirm email" ✅
3. Click **Save**

### ☐ 6. Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   https://your-domain.com/**
   https://www.your-domain.com/**
   ```
3. Set **Site URL**: `https://your-domain.com`

### ☐ 7. Customize Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Edit **"Confirm signup"**:

```html
<h2>Welcome to ExamPrepPlus!</h2>
<p>Thanks for signing up! Click below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email Address</a></p>
<p>This link expires in 24 hours.</p>
```

3. Edit **Subject**: "Confirm your ExamPrepPlus account"
4. Click **Save**

### ☐ 8. Set Up Custom SMTP (Recommended)

For better email deliverability:

1. Go to **Authentication** → **Settings** → **SMTP**
2. Choose provider (SendGrid, AWS SES, Mailgun, etc.)
3. Enter credentials
4. Test by sending a confirmation email

**Free Options:**
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: $0.10 per 1,000 emails

---

## Security Configuration

### ☐ 9. Set Up Row Level Security (RLS)

Run in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Anyone can read questions (for practice mode)
CREATE POLICY "Anyone can view questions"
ON questions FOR SELECT
USING (true);

-- Only admins can modify questions
CREATE POLICY "Admins can manage questions"
ON questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Users can view their own test attempts
CREATE POLICY "Users can view own attempts"
ON user_test_attempts FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own attempts
CREATE POLICY "Users can create own attempts"
ON user_test_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### ☐ 10. Create Admin User

```sql
-- First, sign up via your app, then run:
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';

-- Verify
SELECT email, role FROM users WHERE role = 'admin';
```

---

## Deployment

### ☐ 11. Deploy to Hosting Platform

#### **For Vercel:**

1. Connect GitHub repository
2. Set environment variables (step 2)
3. Set build command: `npm run migrate:prod && npm run build`
4. Set install command: `npm install`
5. Deploy!

#### **For Railway:**

1. New Project → Deploy from GitHub
2. Add environment variables (step 2)
3. Set build command: `npm install && npm run migrate:prod && npm run build`
4. Set start command: `npm run start`
5. Deploy!

#### **For Render:**

1. New Web Service → Connect repository
2. Add environment variables (step 2)
3. Build command: `npm run migrate:prod && npm run build`
4. Start command: `npm run start`
5. Deploy!

---

## Post-Deployment Testing

### ☐ 12. Test Authentication Flow

- [ ] Visit your production URL
- [ ] Click "Sign Up"
- [ ] Create account with real email
- [ ] Check email for confirmation link
- [ ] Click confirmation link
- [ ] Sign in with credentials
- [ ] Verify user avatar shows in header
- [ ] Click avatar → verify dropdown shows
- [ ] Sign out
- [ ] Sign in again

### ☐ 13. Test Admin Access

- [ ] Sign in as admin user (created in step 10)
- [ ] Navigate to `/admin`
- [ ] Verify admin dashboard loads
- [ ] Check role shows as "admin"
- [ ] Sign out
- [ ] Sign in as regular user
- [ ] Try to access `/admin`
- [ ] Verify redirect to login

### ☐ 14. Verify Database Sync

Run in Supabase SQL Editor:

```sql
-- Check user was created in both tables
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_count,
  (SELECT COUNT(*) FROM public.users) as public_count;
-- Both should be equal!

-- Verify same IDs
SELECT 
  au.id as auth_id,
  u.id as public_id,
  au.email
FROM auth.users au
JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC
LIMIT 5;
```

### ☐ 15. Test Error Handling

- [ ] Try signing up with existing email
- [ ] Try signing in with wrong password
- [ ] Try signing in before confirming email
- [ ] Verify error messages are helpful but generic

---

## Performance & Monitoring

### ☐ 16. Set Up Monitoring

**Vercel:**
- Analytics enabled automatically
- Check deployment logs
- Monitor function errors

**Supabase:**
1. Go to **Logs** → Review auth logs
2. Set up **Database** → **Advisors** alerts
3. Monitor **API** usage

### ☐ 17. Performance Checks

- [ ] Test page load speed (< 3 seconds)
- [ ] Check Lighthouse score (aim for 90+)
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Safari, Firefox)

---

## Security Hardening

### ☐ 18. Security Best Practices

- [ ] **Enable** Supabase Auth → "Secure email change"
- [ ] **Disable** Supabase Auth → "Enable anonymous sign-ins" (unless needed)
- [ ] Review **API** → **API Settings** → Rate limits
- [ ] Set up **Database** → **Backups** schedule (daily recommended)

### ☐ 19. Environment Cleanup

- [ ] Remove any test users from production
- [ ] Verify no development API keys in environment variables
- [ ] Check no `.env.local` committed to Git
- [ ] Review Supabase API logs for suspicious activity

---

## Optional Enhancements

### ☐ 20. Custom Domain (If not using Vercel/Railway domain)

1. Add domain to hosting platform
2. Update DNS records
3. Update Supabase redirect URLs to include custom domain
4. Update `NEXT_PUBLIC_SUPABASE_URL` if using custom Supabase domain

### ☐ 21. Analytics

- [ ] Set up Vercel Analytics (built-in)
- [ ] Add Google Analytics (optional)
- [ ] Add error tracking (Sentry, LogRocket, etc.)

### ☐ 22. Email Deliverability

- [ ] Set up SPF records for custom SMTP
- [ ] Set up DKIM records
- [ ] Add DMARC policy
- [ ] Test email delivery to Gmail, Outlook, etc.

---

## Launch Checklist

### ☐ 23. Final Review

- [ ] All environment variables set
- [ ] Migrations applied successfully
- [ ] Email confirmation working
- [ ] Admin user created
- [ ] RLS policies applied
- [ ] No console errors on production site
- [ ] All critical user flows tested
- [ ] Mobile responsive
- [ ] Error monitoring active
- [ ] Backups configured

### ☐ 24. Go Live!

- [ ] Announce to stakeholders
- [ ] Share production URL
- [ ] Monitor logs for first hour
- [ ] Test with real users
- [ ] Collect feedback

---

## Rollback Plan

If something goes wrong:

### Emergency Rollback

1. **Vercel/Railway**: Rollback to previous deployment in dashboard
2. **Database**: Restore from Supabase backup (Settings → Database → Backups)
3. **Migrations**: Manually revert triggers:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_login ON auth.sessions;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_user_login();
```

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app

---

## 🎉 Congratulations!

Your ExamPrepPlus app is now live in production with:
- ✅ Secure authentication
- ✅ Email confirmation
- ✅ Admin access control
- ✅ Database triggers
- ✅ Row Level Security
- ✅ Monitoring & backups

**Next Steps**: Start building features (Admin CRUD, CSV Import, Test Engine, etc.)

---

**Estimated Time**: 1-2 hours for first deployment

**Last Updated**: November 9, 2025
