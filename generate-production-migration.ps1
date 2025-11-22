#!/usr/bin/env pwsh
# ============================================
# Quick Migration Generator
# ============================================
# Generates a single SQL file with ALL migrations
# Run: .\generate-production-migration.ps1
# ============================================

Write-Host "`n🔧 Generating Production Migration File...`n" -ForegroundColor Cyan

$combinedMigration = @"
-- ============================================
-- ExamPrepPlus - Complete Production Migration
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- for fresh production database setup
-- ============================================

"@

# Migration files in order
$migrations = @(
    @{File="drizzle\0000_green_blink.sql"; Title="BASE SCHEMA - Core Tables"},
    @{File="drizzle\0001_auth_triggers.sql"; Title="AUTH TRIGGERS"},
    @{File="drizzle\0002_fix_auth_trigger.sql"; Title="AUTH TRIGGER FIX"},
    @{File="drizzle\0003_add_question_verification.sql"; Title="QUESTION VERIFICATION"},
    @{File="drizzle\0006_remove_draft_status.sql"; Title="CLEANUP DRAFT STATUS"},
    @{File="drizzle\0007_add_test_fields.sql"; Title="TEST CONFIGURATION FIELDS"},
    @{File="migrations\add-practice-mode-tables.sql"; Title="PRACTICE MODE TABLES"},
    @{File="migrations\add-practice-streaks.sql"; Title="STREAK TRACKING TABLES (NEW)"}
)

foreach ($migration in $migrations) {
    $filePath = Join-Path $PSScriptRoot $migration.File
    
    if (Test-Path $filePath) {
        $combinedMigration += "`n`n-- ============================================`n"
        $combinedMigration += "-- $($migration.Title)`n"
        $combinedMigration += "-- File: $($migration.File)`n"
        $combinedMigration += "-- ============================================`n"
        $combinedMigration += Get-Content $filePath -Raw
        Write-Host "✅ Added: $($migration.Title)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Missing: $($migration.File)" -ForegroundColor Yellow
    }
}

# Add verification queries at the end
$combinedMigration += @"


-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after applying the migration above

-- 1. Check all tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected: 17 tables

-- 2. Verify practice tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'weak_topics', 
  'revision_schedule',
  'practice_streaks', 
  'practice_calendar'
)
ORDER BY table_name;
-- Expected: 4 rows

-- 3. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
-- All should show 't' (true)

-- ✅ If all checks pass, migration is complete!
"@

# Save to file
$outputFile = "production-migration-complete.sql"
$combinedMigration | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "`n✅ Migration file created: $outputFile" -ForegroundColor Green

# Copy to clipboard
try {
    Set-Clipboard -Value $combinedMigration
    Write-Host "✅ Migration SQL copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not copy to clipboard" -ForegroundColor Yellow
}

Write-Host @"

╔═══════════════════════════════════════════╗
║   Production Migration Ready! 🎉          ║
╚═══════════════════════════════════════════╝

📋 Next Steps:

1. Open Supabase SQL Editor:
   https://app.supabase.com/project/[YOUR_PROD_PROJECT]/sql

2. Paste the SQL (in clipboard or from file):
   $outputFile

3. Click RUN (this may take 30-60 seconds)

4. Run the verification queries at the bottom

5. Expected Result:
   ✅ 17 tables created
   ✅ 4 practice tables exist
   ✅ RLS enabled on all tables

⚠️  IMPORTANT:
   - Backup your database first (if not fresh)
   - This script is idempotent (safe to re-run)
   - Uses IF NOT EXISTS for safety

"@ -ForegroundColor Cyan

Write-Host ""
