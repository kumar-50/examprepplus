# Database Migration Status Report

**Generated:** November 22, 2025  
**Project:** ExamPrepPlus  
**Database:** Supabase PostgreSQL

---

## ✅ Applied Migrations (Drizzle ORM)

These migrations are tracked in `drizzle/meta/_journal.json` and should already be applied:

### 1. **0000_green_blink.sql** ✅
**Status:** Applied  
**Date:** 2024-11-08  
**Tables Created:**
- `users` - User profiles with roles and subscription status
- `sections` - Exam sections (Math, Reasoning, GK, etc.)
- `topics` - Sub-topics within sections
- `questions` - Question bank with answers and explanations
- `tests` - Test configurations (mock/live/sectional/practice)
- `test_questions` - Junction table for test-question relationships
- `user_test_attempts` - Test session records
- `user_answers` - Individual answer records
- `subscription_plans` - Available plans
- `subscriptions` - User subscriptions
- `coupons` - Discount codes
- `coupon_usage` - Coupon redemption tracking

### 2. **0001_auth_triggers.sql** ✅
**Status:** Applied  
**Date:** 2024-11-10  
**Changes:**
- Added auth trigger to sync Supabase auth users to `users` table
- Automatically creates profile on user signup

### 3. **0002_fix_auth_trigger.sql** ✅
**Status:** Applied  
**Date:** 2024-11-10  
**Changes:**
- Fixed auth trigger logic

### 4. **0003_add_question_verification.sql** ✅
**Status:** Applied  
**Date:** 2024-11-10  
**Changes:**
- Added question verification workflow
- Added `verification_status` column to questions

### 5. **0004_add_draft_status.sql** ✅
**Status:** Applied  
**Date:** 2024-11-10  
**Changes:**
- Added draft status to questions

### 6. **0005_set_draft_default.sql** ✅
**Status:** Applied  
**Date:** 2024-11-10  
**Changes:**
- Set default verification status to draft

### 7. **0006_remove_draft_status.sql** ✅
**Status:** Applied  
**Date:** 2024-11-10  
**Changes:**
- Removed draft status (schema adjustment)

### 8. **0007_add_test_fields.sql** ✅
**Status:** Applied  
**Date:** 2024-11-11  
**Changes:**
- Added test configuration fields

---

## ⚠️ Pending Manual Migrations

These migrations need to be applied manually via Supabase SQL Editor:

### 1. **add-practice-mode-tables.sql** ❌ NOT APPLIED
**Priority:** HIGH  
**Required For:** Practice Mode Feature  
**Tables to Create:**
- `weak_topics` - AI-identified weak areas for spaced repetition
- `revision_schedule` - Scheduled practice sessions

**Fields to Add:**
- `user_test_attempts.scheduled_for` - Practice scheduling timestamp

**How to Apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `migrations/add-practice-mode-tables.sql`
3. Execute the query
4. Verify tables exist in Table Editor

**Verification Query:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('weak_topics', 'revision_schedule');
```

---

### 2. **add-practice-streaks.sql** ❌ NOT APPLIED (NEW)
**Priority:** HIGH  
**Required For:** Streak Tracking Feature (Just Implemented)  
**Tables to Create:**
- `practice_streaks` - User streak data (current/longest/total days)
- `practice_calendar` - Daily practice activity tracking

**Includes:**
- Row Level Security (RLS) policies
- Indexes for performance
- Unique constraints

**How to Apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `migrations/add-practice-streaks.sql`
3. Execute the query
4. Verify tables exist in Table Editor

**Verification Query:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('practice_streaks', 'practice_calendar');
```

---

## 📋 Migration Order (Recommended)

Apply these migrations in order:

1. ✅ **Already Applied:** Drizzle migrations (0000-0007)
2. ⚠️ **Apply Next:** `add-practice-mode-tables.sql`
3. ⚠️ **Apply After:** `add-practice-streaks.sql`

---

## 🔍 Current Database Status Check

Run this query in Supabase SQL Editor to see what's currently in your database:

```sql
-- Check all tables
SELECT table_name, 
       (SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check for practice-related tables
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weak_topics') 
    THEN '✅ weak_topics EXISTS'
    ELSE '❌ weak_topics MISSING'
  END as weak_topics_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revision_schedule') 
    THEN '✅ revision_schedule EXISTS'
    ELSE '❌ revision_schedule MISSING'
  END as revision_schedule_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practice_streaks') 
    THEN '✅ practice_streaks EXISTS'
    ELSE '❌ practice_streaks MISSING'
  END as practice_streaks_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practice_calendar') 
    THEN '✅ practice_calendar EXISTS'
    ELSE '❌ practice_calendar MISSING'
  END as practice_calendar_status;

-- Check if scheduled_for column exists in user_test_attempts
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_test_attempts' 
      AND column_name = 'scheduled_for'
    ) 
    THEN '✅ user_test_attempts.scheduled_for EXISTS'
    ELSE '❌ user_test_attempts.scheduled_for MISSING'
  END as scheduled_for_status;
```

---

## 🚀 Quick Apply Instructions

### Step 1: Verify Current State
Copy and run the "Current Database Status Check" query above to see what's missing.

### Step 2: Apply Practice Mode Tables
```sql
-- Copy entire content from: migrations/add-practice-mode-tables.sql
-- Paste and execute in Supabase SQL Editor
```

### Step 3: Apply Practice Streaks Tables
```sql
-- Copy entire content from: migrations/add-practice-streaks.sql
-- Paste and execute in Supabase SQL Editor
```

### Step 4: Verify Success
Run the verification queries above to confirm all tables exist.

---

## ⚠️ Important Notes

1. **RLS Policies:** Both migrations include Row Level Security policies
2. **Indexes:** Performance indexes are created automatically
3. **Foreign Keys:** All tables properly reference existing tables
4. **Rollback:** Keep a backup before applying (Supabase has point-in-time recovery)
5. **Idempotent:** Both migrations use `IF NOT EXISTS` so they're safe to re-run

---

## 📊 Expected Final Schema

After applying all migrations, you should have:

**Core Tables (13):**
- users, sections, topics, questions, tests
- test_questions, user_test_attempts, user_answers
- subscription_plans, subscriptions, coupons, coupon_usage

**Practice Mode Tables (4 - NEW):**
- weak_topics, revision_schedule
- practice_streaks, practice_calendar

**Total: 17 tables**

---

## 🛠️ Troubleshooting

### If migration fails:
1. Check Supabase logs for specific error
2. Verify foreign key references exist
3. Ensure no naming conflicts
4. Check RLS policies don't conflict

### Common Issues:
- **"relation already exists"** - Table already created, safe to ignore
- **"column already exists"** - Column already added, safe to ignore
- **"foreign key violation"** - Referenced table doesn't exist yet

---

## 📞 Need Help?

- View Supabase logs: Project → Logs → Database
- Check table structure: Project → Table Editor
- SQL Editor: Project → SQL Editor
- Database Settings: Project → Settings → Database
