-- ============================================
-- DATABASE MIGRATION VERIFICATION SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor to check current status
-- Project: ExamPrepPlus
-- Date: November 22, 2025
-- ============================================

\echo '============================================'
\echo 'DATABASE MIGRATION STATUS CHECK'
\echo '============================================'
\echo ''

-- 1. List all tables in database
\echo '1. ALL TABLES IN DATABASE:'
\echo '-------------------------------------------'
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo '2. CORE TABLES STATUS (Base Schema):'
\echo '-------------------------------------------'
SELECT 
  'users' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
  THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'sections', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sections') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'topics', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'questions', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'tests', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tests') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'test_questions', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_questions') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'user_test_attempts', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_test_attempts') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'user_answers', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_answers') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'subscription_plans', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'subscriptions', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'coupons', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupons') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'coupon_usage', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupon_usage') THEN '✅ EXISTS' ELSE '❌ MISSING' END;

\echo ''
\echo '3. PRACTICE MODE TABLES STATUS:'
\echo '-------------------------------------------'
SELECT 
  'weak_topics' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weak_topics') 
  THEN '✅ EXISTS' ELSE '❌ MISSING - Apply add-practice-mode-tables.sql' END as status
UNION ALL
SELECT 
  'revision_schedule',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revision_schedule') 
  THEN '✅ EXISTS' ELSE '❌ MISSING - Apply add-practice-mode-tables.sql' END;

\echo ''
\echo '4. STREAK TRACKING TABLES STATUS (NEW):'
\echo '-------------------------------------------'
SELECT 
  'practice_streaks' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practice_streaks') 
  THEN '✅ EXISTS' ELSE '❌ MISSING - Apply add-practice-streaks.sql' END as status
UNION ALL
SELECT 
  'practice_calendar',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practice_calendar') 
  THEN '✅ EXISTS' ELSE '❌ MISSING - Apply add-practice-streaks.sql' END;

\echo ''
\echo '5. PRACTICE MODE COLUMNS STATUS:'
\echo '-------------------------------------------'
SELECT 
  'user_test_attempts.scheduled_for' as column_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_test_attempts' 
    AND column_name = 'scheduled_for'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING - Apply add-practice-mode-tables.sql' END as status;

\echo ''
\echo '6. RECORD COUNTS:'
\echo '-------------------------------------------'
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM users
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'tests', COUNT(*) FROM tests
UNION ALL
SELECT 'weak_topics', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weak_topics')
  THEN (SELECT COUNT(*)::text FROM weak_topics)
  ELSE 'N/A - Table not created yet' END::integer
UNION ALL
SELECT 'practice_streaks', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practice_streaks')
  THEN (SELECT COUNT(*)::text FROM practice_streaks)
  ELSE 'N/A - Table not created yet' END::integer;

\echo ''
\echo '============================================'
\echo 'SUMMARY:'
\echo '============================================'
\echo 'If you see ❌ MISSING above, you need to:'
\echo '1. Apply add-practice-mode-tables.sql first'
\echo '2. Then apply add-practice-streaks.sql'
\echo '3. Re-run this verification script'
\echo '============================================'
