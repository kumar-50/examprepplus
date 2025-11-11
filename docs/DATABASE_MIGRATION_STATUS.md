# Database Migration Guide

## ✅ Completed Steps

All database schemas have been created using Drizzle ORM:

### Created Schemas:
1. **users** - User profiles with subscription and role info
2. **sections** - Top-level exam categories (Math, Reasoning, GK)
3. **topics** - Sub-categories within sections
4. **questions** - Question bank with 4 options, explanations, images
5. **tests** - Test configurations (mock, live, sectional, practice)
6. **test_questions** - Junction table linking tests to questions
7. **user_test_attempts** - Records of test sessions
8. **user_answers** - Individual answers per attempt
9. **subscription_plans** - Available subscription tiers
10. **subscriptions** - User subscription purchases
11. **coupons** - Discount codes
12. **coupon_usage** - Coupon redemption tracking

### Migration File Generated:
✅ `drizzle/0000_green_blink.sql` - Contains all CREATE TABLE and ENUM statements

## 🔧 Next Steps - Apply Migrations to Supabase

### Option 1: Using Drizzle Kit Push (Recommended for Development)

This will directly push the schema to your database:

```bash
npm run db:push
```

### Option 2: Using SQL Editor in Supabase Dashboard

1. Go to https://app.supabase.com/project/uzghztsuyefnzxcekckk/sql
2. Click "New Query"
3. Copy the contents of `drizzle/0000_green_blink.sql`
4. Paste and run the query

### Option 3: Manual Migration

First, ensure you have your database password and update `.env.local`:

```bash
# Get your database password from Supabase Dashboard -> Project Settings -> Database
# Update DATABASE_URL in .env.local with your actual password

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.uzghztsuyefnzxcekckk.supabase.co:5432/postgres
```

Then run:

```bash
npm run db:push
```

## ⚠️ Important Notes

1. **Environment Variables**: Make sure `DATABASE_URL` is set in `.env.local`
2. **Transaction Mode**: The connection string should use transaction mode (port 5432)
3. **First Time**: This is your initial migration, so all tables will be created fresh
4. **Backup**: While this is a new database, always backup before running migrations in production

## 🧪 Verify Migration Success

After running the migration, verify in Supabase Dashboard:

1. Go to Table Editor: https://app.supabase.com/project/uzghztsuyefnzxcekckk/editor
2. You should see all 12 tables created
3. Check that enums are created under Database -> Enums

## 📊 Database Commands Reference

```bash
# Generate new migration after schema changes
npm run db:generate

# Push schema directly to database (dev)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio to browse data
npm run db:studio
```

## 🔍 Drizzle Studio

To visually browse and edit your database:

```bash
npm run db:studio
```

This opens a web interface at http://localhost:4983
