#!/usr/bin/env pwsh
# ============================================
# ExamPrepPlus - Production Deployment Script
# ============================================
# This script helps deploy the application to production
# Run: .\deploy-production.ps1
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'staging', 'production')]
    [string]$Environment = 'production',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Colors for output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Step { Write-Host "`n📌 $args" -ForegroundColor Magenta }

# ============================================
# Configuration
# ============================================
$ProjectRoot = $PSScriptRoot
$MigrationsDir = Join-Path $ProjectRoot "migrations"
$DrizzleDir = Join-Path $ProjectRoot "drizzle"

Write-Host @"

╔═══════════════════════════════════════════╗
║   ExamPrepPlus Deployment Script          ║
║   Environment: $Environment                   ║
╚═══════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# ============================================
# Step 1: Pre-flight Checks
# ============================================
Write-Step "Step 1: Pre-flight Checks"

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}
Write-Success "Node.js found: $(node --version)"

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed."
    exit 1
}
Write-Success "npm found: $(npm --version)"

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Warning "Git is not installed. Version control features will be limited."
} else {
    Write-Success "Git found: $(git --version)"
}

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Warning "Vercel CLI not found. Install with: npm i -g vercel"
    $installVercel = Read-Host "Install Vercel CLI now? (y/n)"
    if ($installVercel -eq 'y') {
        npm i -g vercel
    }
}

# ============================================
# Step 2: Environment Variables Check
# ============================================
Write-Step "Step 2: Checking Environment Variables"

$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Error "Environment file $envFile not found!"
    Write-Info "Please create $envFile with required variables"
    exit 1
}
Write-Success "Environment file found: $envFile"

# Check for required variables
$requiredVars = @(
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
)

$envContent = Get-Content $envFile -Raw
$missingVars = @()

foreach ($var in $requiredVars) {
    if ($envContent -notmatch $var) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Error "Missing required environment variables:"
    $missingVars | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}
Write-Success "All required environment variables present"

# ============================================
# Step 3: Install Dependencies
# ============================================
Write-Step "Step 3: Installing Dependencies"

if (-not (Test-Path "node_modules")) {
    Write-Info "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
} else {
    Write-Info "Dependencies already installed. Run 'npm install' to update."
}
Write-Success "Dependencies ready"

# ============================================
# Step 4: Run Tests
# ============================================
if (-not $SkipTests) {
    Write-Step "Step 4: Running Tests"
    
    Write-Info "Type checking..."
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Type check failed"
        exit 1
    }
    Write-Success "Type check passed"
    
    Write-Info "Linting..."
    npm run lint 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Linting found issues (non-blocking)"
    } else {
        Write-Success "Linting passed"
    }
} else {
    Write-Info "Skipping tests (--SkipTests flag used)"
}

# ============================================
# Step 5: Build Application
# ============================================
if (-not $SkipBuild) {
    Write-Step "Step 5: Building Application"
    
    Write-Info "Running production build..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }
    Write-Success "Build completed successfully"
} else {
    Write-Info "Skipping build (--SkipBuild flag used)"
}

# ============================================
# Step 6: Database Migrations
# ============================================
Write-Step "Step 6: Database Migrations"

Write-Info "Preparing migration SQL..."

# Create combined migration file
$combinedMigration = @"
-- ============================================
-- ExamPrepPlus - Complete Production Migration
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- ============================================

-- This file contains ALL migrations needed for production
-- Run this in Supabase SQL Editor for fresh production setup

-- ============================================
-- BASE SCHEMA (0000_green_blink.sql)
-- ============================================
"@

# Check if migration files exist
$migrationFiles = @(
    @{Path="$DrizzleDir\0000_green_blink.sql"; Name="Base Schema"},
    @{Path="$DrizzleDir\0001_auth_triggers.sql"; Name="Auth Triggers"},
    @{Path="$DrizzleDir\0002_fix_auth_trigger.sql"; Name="Auth Trigger Fix"},
    @{Path="$DrizzleDir\0003_add_question_verification.sql"; Name="Question Verification"},
    @{Path="$DrizzleDir\0006_remove_draft_status.sql"; Name="Draft Status Cleanup"},
    @{Path="$DrizzleDir\0007_add_test_fields.sql"; Name="Test Fields"},
    @{Path="$MigrationsDir\add-practice-mode-tables.sql"; Name="Practice Mode Tables"},
    @{Path="$MigrationsDir\add-practice-streaks.sql"; Name="Streak Tracking Tables"}
)

foreach ($migration in $migrationFiles) {
    if (Test-Path $migration.Path) {
        $combinedMigration += "`n`n-- ============================================`n"
        $combinedMigration += "-- $($migration.Name)`n"
        $combinedMigration += "-- ============================================`n"
        $combinedMigration += Get-Content $migration.Path -Raw
        Write-Success "Added: $($migration.Name)"
    } else {
        Write-Warning "Missing: $($migration.Path)"
    }
}

# Save combined migration
$outputFile = "production-migration-complete.sql"
$combinedMigration | Out-File -FilePath $outputFile -Encoding UTF8
Write-Success "Created: $outputFile"

# Copy to clipboard
Set-Clipboard -Value $combinedMigration
Write-Success "Migration SQL copied to clipboard!"

Write-Info "`nTo apply migrations:"
Write-Host "  1. Open: https://app.supabase.com/project/YOUR_PROD_PROJECT/sql" -ForegroundColor White
Write-Host "  2. Paste the SQL (already in clipboard)" -ForegroundColor White
Write-Host "  3. Click RUN" -ForegroundColor White

if (-not $DryRun) {
    $applyMigrations = Read-Host "`nHave you applied the migrations to production? (y/n)"
    if ($applyMigrations -ne 'y') {
        Write-Warning "Please apply migrations before continuing"
        Write-Info "You can run this script again with -DryRun flag"
        exit 0
    }
}

# ============================================
# Step 7: Vercel Deployment
# ============================================
Write-Step "Step 7: Vercel Deployment"

if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Info "Checking Vercel project status..."
    
    if (-not $DryRun) {
        $deploy = Read-Host "Deploy to Vercel now? (y/n)"
        
        if ($deploy -eq 'y') {
            # Check if project is linked
            if (-not (Test-Path ".vercel")) {
                Write-Info "Linking Vercel project..."
                vercel link
            }
            
            # Deploy
            if ($Environment -eq 'production') {
                Write-Info "Deploying to PRODUCTION..."
                vercel --prod
            } else {
                Write-Info "Deploying preview..."
                vercel
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Deployment completed!"
            } else {
                Write-Error "Deployment failed"
                exit 1
            }
        } else {
            Write-Info "Skipping deployment. You can deploy manually with: vercel --prod"
        }
    } else {
        Write-Info "[DRY RUN] Would deploy with: vercel --prod"
    }
} else {
    Write-Warning "Vercel CLI not installed. Manual deployment required."
    Write-Info "Deploy options:"
    Write-Host "  1. Push to GitHub (auto-deploys if connected)" -ForegroundColor White
    Write-Host "  2. Install Vercel CLI: npm i -g vercel" -ForegroundColor White
    Write-Host "  3. Deploy from Vercel dashboard" -ForegroundColor White
}

# ============================================
# Step 8: Post-Deployment Verification
# ============================================
Write-Step "Step 8: Post-Deployment Checks"

$verificationQuery = @"
-- Verify production database
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: 17 tables total
-- Core: 13, Practice: 4
"@

Set-Clipboard -Value $verificationQuery
Write-Success "Verification query copied to clipboard"

Write-Info "`nPost-deployment checklist:"
Write-Host "  ✓ Run verification query in Supabase" -ForegroundColor White
Write-Host "  ✓ Test login/signup" -ForegroundColor White
Write-Host "  ✓ Test practice mode" -ForegroundColor White
Write-Host "  ✓ Complete a practice session" -ForegroundColor White
Write-Host "  ✓ Verify streak tracking works" -ForegroundColor White
Write-Host "  ✓ Check Vercel logs for errors" -ForegroundColor White

# ============================================
# Summary
# ============================================
Write-Host @"

╔═══════════════════════════════════════════╗
║   Deployment Complete! 🚀                 ║
╚═══════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Info "Files Created:"
Write-Host "  • production-migration-complete.sql" -ForegroundColor White

Write-Info "`nNext Steps:"
Write-Host "  1. Verify database tables in Supabase" -ForegroundColor White
Write-Host "  2. Test production site thoroughly" -ForegroundColor White
Write-Host "  3. Monitor Vercel logs" -ForegroundColor White
Write-Host "  4. Set up error tracking (optional)" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • PRODUCTION-DEPLOYMENT.md - Full guide" -ForegroundColor White
Write-Host "  • MIGRATION-STATUS.md - Migration reference" -ForegroundColor White

Write-Host ""
