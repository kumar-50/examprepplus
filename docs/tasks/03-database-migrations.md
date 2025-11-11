# 03 Database Migrations with Drizzle ORM

## Objective
Define and migrate all required tables using Drizzle ORM with proper schema structure, relationships, indexes, constraints, and Row Level Security (RLS) policies as defined in the ExamPrepPlus data model.

## Data Model Overview

### Core Entities
- **users**: Extends Supabase auth.users with profile and subscription fields
- **sections**: Top-level exam categories (Math, Reasoning, GK)
- **topics**: Sub-categories within sections
- **questions**: Question bank with options, correct answers, explanations
- **tests**: Test configurations (mock, live, sectional, practice)
- **test_questions**: Many-to-many linking tests to questions with ordering
- **user_test_attempts**: Records of completed/ongoing test sessions
- **user_answers**: Individual answers per attempt
- **subscription_plans**: Available subscription tiers
- **subscriptions**: User subscription records
- **coupons**: Discount codes
- **coupon_usage**: Tracks coupon redemptions
- **user_analytics**: Aggregated performance metrics (optional, can be computed)

## Detailed Schema with Drizzle

### Installation & Setup
```powershell
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

Create `drizzle.config.ts`:
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Schema Definitions

Create `src/db/schema/users.ts`:
```ts
import { pgTable, uuid, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';

export const subscriptionStatusEnum = pgEnum('subscription_status', ['free', 'active', 'expired', 'cancelled']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Supabase auth.users mapping done separately
  fullName: text('full_name'),
  email: text('email'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('user').notNull(),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('free'),
  subscriptionId: uuid('subscription_id'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

Create `src/db/schema/sections.ts`:
```ts
import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const examTypeEnum = pgEnum('exam_type', ['RRB_NTPC','SSC_CGL','BANK_PO','OTHER']);

export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  examType: examTypeEnum('exam_type').default('RRB_NTPC').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

Create `src/db/schema/topics.ts`:
```ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { sections } from './sections';

export const topics = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  sectionId: uuid('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

Create `src/db/schema/questions.ts`:
```ts
import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sections } from './sections';
import { topics } from './topics';
import { users } from './users';

export const difficultyLevelEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard']);
export const questionStatusEnum = pgEnum('question_status', ['pending', 'approved', 'rejected']);

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionText: text('question_text').notNull(),
  option1: text('option_1').notNull(),
  option2: text('option_2').notNull(),
  option3: text('option_3').notNull(),
  option4: text('option_4').notNull(),
  correctOption: integer('correct_option').notNull(), // 1-4 (CHECK constraint added via migration)
  explanation: text('explanation'),
  sectionId: uuid('section_id').notNull().references(() => sections.id),
  topicId: uuid('topic_id').references(() => topics.id),
  difficultyLevel: difficultyLevelEnum('difficulty_level').default('medium'),
  createdBy: uuid('created_by').references(() => users.id),
  status: questionStatusEnum('status').default('pending').notNull(),
  isVerified: boolean('is_verified').default(false),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isActive: boolean('is_active').default(true),
});
```

Create `src/db/schema/tests.ts`:
```ts
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const testTypeEnum = pgEnum('test_type', ['mock', 'live', 'sectional', 'practice']);

export const tests = pgTable('tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  testType: testTypeEnum('test_type').notNull(),
  totalQuestions: integer('total_questions').notNull().default(0),
  marks: integer('marks').notNull().default(0),
  duration: integer('duration'), // minutes, null for practice
  negativeMarking: boolean('negative_marking').default(false), // legacy flag
  negativeMarkingValue: numeric('negative_marking_value', { precision: 5, scale: 2 }), // e.g. 0.25
  scheduledAt: timestamp('scheduled_at'),
  isPublished: boolean('is_published').default(false),
  isFree: boolean('is_free').default(false),
  instructions: text('instructions'),
  testPattern: jsonb('test_pattern'), // { sections: [{section_id, question_count}], navigation }
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

Create `src/db/schema/test-questions.ts`:
```ts
import { pgTable, uuid, integer, unique } from 'drizzle-orm/pg-core';
import { tests } from './tests';
import { questions } from './questions';
import { sections } from './sections';

export const testQuestions = pgTable('test_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  testId: uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  questionOrder: integer('question_order').notNull(),
  marks: integer('marks').default(1),
  sectionId: uuid('section_id').references(() => sections.id),
}, (table) => ({
  uniqTestQuestion: unique().on(table.testId, table.questionId),
}));
```

Create `src/db/schema/attempts.ts`:
```ts
import { pgTable, uuid, numeric, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { tests } from './tests';

export const attemptStatusEnum = pgEnum('attempt_status', ['in_progress','submitted','cancelled']);

export const userTestAttempts = pgTable('user_test_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  testId: uuid('test_id').notNull().references(() => tests.id),
  userId: uuid('user_id').notNull(),
  score: numeric('score', { precision: 5, scale: 2 }).default('0'),
  correctCount: integer('correct_count').default(0),
  wrongCount: integer('wrong_count').default(0),
  unansweredCount: integer('unanswered_count').default(0),
  accuracy: numeric('accuracy', { precision: 5, scale: 2 }), // derived correct/(correct+wrong)*100
  sectionBreakdown: jsonb('section_breakdown'),
  answersJson: jsonb('answers_json'),
  durationSeconds: integer('duration_seconds'),
  status: attemptStatusEnum('status').default('in_progress').notNull(),
  startedAt: timestamp('started_at'),
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

Create `src/db/schema/answers.ts`:
```ts
import { pgTable, uuid, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core';
import { userTestAttempts } from './attempts';
import { questions } from './questions';

export const userAnswers = pgTable('user_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id').notNull().references(() => userTestAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id),
  selectedOption: integer('selected_option'), // 1-4 or null if unanswered
  isCorrect: boolean('is_correct'),
  isFlagged: boolean('is_flagged').default(false),
  timeSpent: integer('time_spent'), // seconds
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqAttemptQuestion: unique().on(table.attemptId, table.questionId),
}));
```

Create `src/db/schema/subscriptions.ts`:
```ts
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const subscriptionPlanStatusEnum = pgEnum('subscription_plan_status', ['pending', 'active', 'expired', 'cancelled']);
export const subscriptionBillingCycleEnum = pgEnum('subscription_billing_cycle', ['monthly','quarterly','half_yearly','yearly']);
export const paymentStatusEnum = pgEnum('payment_status', ['initiated','authorized','captured','failed','refunded']);

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  priceInr: integer('price_inr').notNull(),
  durationDays: integer('duration_days').notNull(),
  billingCycle: subscriptionBillingCycleEnum('billing_cycle').default('monthly').notNull(),
  features: jsonb('features'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),
  paymentStatus: paymentStatusEnum('payment_status').default('initiated'),
  amountPaid: integer('amount_paid').notNull(),
  status: subscriptionPlanStatusEnum('status').default('pending'),
  startsAt: timestamp('starts_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

Create `src/db/schema/coupons.ts`:
```ts
import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { subscriptions } from './subscriptions';

export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(),
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const couponUsage = pgTable('coupon_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id').notNull().references(() => coupons.id),
  userId: uuid('user_id').notNull(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  usedAt: timestamp('used_at').defaultNow(),
}, (table) => ({
  uniqCouponUser: unique().on(table.couponId, table.userId),
}));
```

Create `src/db/schema/analytics.ts` (optional):
```ts
import { pgTable, uuid, integer, numeric, timestamp, unique } from 'drizzle-orm/pg-core';
import { sections } from './sections';
import { topics } from './topics';

export const userAnalytics = pgTable('user_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  sectionId: uuid('section_id').references(() => sections.id),
  topicId: uuid('topic_id').references(() => topics.id),
  totalAttempted: integer('total_attempted').default(0),
  totalCorrect: integer('total_correct').default(0),
  accuracy: numeric('accuracy', { precision: 5, scale: 2 }),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqUserSectionTopic: unique().on(table.userId, table.sectionId, table.topicId),
}));
```

Create `src/db/schema/index.ts`:
```ts
export * from './users';
export * from './sections';
export * from './topics';
export * from './questions';
export * from './tests';
export * from './test-questions';
export * from './attempts';
export * from './answers';
export * from './subscriptions';
export * from './coupons';
export * from './analytics';
// New bookmarks export after creation
export * from './bookmarks';

Create `src/db/schema/bookmarks.ts`:
```ts
import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { questions } from './questions';

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqUserQuestion: unique().on(table.userId, table.questionId),
}));
```
```

## Row Level Security (RLS) Policies

After running migrations, enable RLS and create policies via SQL (Drizzle doesn't manage RLS directly):

Create `drizzle/rls-policies.sql`:
```sql
-- Enable RLS on user-specific tables
ALTER TABLE user_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- user_test_attempts: users can only see their own attempts
CREATE POLICY "Users can view own attempts"
  ON user_test_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON user_test_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
  ON user_test_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin override for attempts
CREATE POLICY "Admins can view all attempts"
  ON user_test_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- user_answers: only accessible via owning attempt
CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_test_attempts
      WHERE user_test_attempts.id = user_answers.attempt_id
      AND user_test_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own answers"
  ON user_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_test_attempts
      WHERE user_test_attempts.id = user_answers.attempt_id
      AND user_test_attempts.user_id = auth.uid()
    )
  );

-- subscriptions: users see only their own
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- System can update subscription status (payment verification)
CREATE POLICY "System can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (true); -- Consider restricting to service role only

-- coupon_usage: users see only their redemptions
CREATE POLICY "Users can view own coupon usage"
  ON coupon_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert coupon usage"
  ON coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_analytics: read-only for own stats
CREATE POLICY "Users can view own analytics"
  ON user_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Public read for published content
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sections"
  ON sections FOR SELECT
  USING (true);

CREATE POLICY "Public can view topics"
  ON topics FOR SELECT
  USING (true);

CREATE POLICY "Public can view active questions"
  ON questions FOR SELECT
  USING (is_active = true AND is_verified = true AND status = 'approved');

CREATE POLICY "Public can view published tests"
  ON tests FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can view test questions for published tests"
  ON test_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_questions.test_id
      AND tests.is_published = true
    )
  );

CREATE POLICY "Public can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true AND expires_at > now());
-- Bookmarks: user scoped only
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Admin write policies
CREATE POLICY "Admins can manage sections"
  ON sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage topics"
  ON topics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
-- Allow admins to approve or reject questions (UPDATE on status/is_verified only)
CREATE POLICY "Admins can approve questions"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (status IN ('approved','rejected'));


CREATE POLICY "Admins can manage tests"
  ON tests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage test questions"
  ON test_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

Note: Add `role` column to `users` table if using role-based admin checks:
```ts
// In src/db/schema/users.ts
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

// Add to users table:
role: userRoleEnum('role').default('user'),
```

## Steps

1. Install Drizzle dependencies:
   ```powershell
   npm install drizzle-orm postgres
   npm install -D drizzle-kit
   ```

2. Create `drizzle.config.ts` in project root with database connection config.

3. Create schema files in `src/db/schema/` as shown above (users, sections, topics, questions, tests, etc.).

4. Generate migration files:
   ```powershell
   npx drizzle-kit generate
   ```

5. Review generated SQL in `drizzle/` folder; verify foreign keys, indexes, constraints.

6. Apply migrations to database:
   ```powershell
   npx drizzle-kit push
   ```
   Or run via Supabase:
   ```powershell
   npx supabase db push
   ```

7. Apply RLS policies via SQL (run `drizzle/rls-policies.sql` in Supabase SQL editor or via CLI).

8. Create Drizzle client in `src/db/index.ts`:
   ```ts
   import { drizzle } from 'drizzle-orm/postgres-js';
   import postgres from 'postgres';
   import * as schema from './schema';

   const connectionString = process.env.DATABASE_URL!;
   const client = postgres(connectionString);
   export const db = drizzle(client, { schema });
   ```

9. Verify tables and RLS policies via Supabase dashboard.

10. Test with sample data insertion using Drizzle:
    ```ts
    import { db } from '@/db';
    import { sections, topics, questions } from '@/db/schema';
    
    await db.insert(sections).values({ name: 'Mathematics', displayOrder: 1 });
    ```

## Acceptance Criteria

- All tables (core + bookmarks) created via Drizzle without errors.
- Foreign key constraints prevent orphaned records (verify with test inserts).
- Drizzle schema exports typed tables for query building.
- RLS policies enabled and functional (test with non-admin user attempting to access another user's data).
- Public can read published tests; users can only access own attempts/subscriptions.
- Admin role can manage all content tables.
- Bookmarks CRUD works (create, list, delete) for owning user only.
- Can insert sample data using Drizzle ORM and query it back with full type safety.
- Enum coverage: exam_type, user_role, subscription_status, subscription_billing_cycle, payment_status, difficulty_level, question_status, attempt_status all created and applied.

## Best Practices

- Use snake_case for DB columns (Drizzle handles camelCase ↔ snake_case mapping).
- JSONB only for truly dynamic/nested data (test_pattern, section_breakdown).
- Prefer normalized tables over JSON when relationships are clear.
- Set sensible defaults to reduce NULL handling.
- Use pgEnum for type-safe enum-like fields (status, difficulty_level, test_type).
- Keep RLS policies minimal and audited; avoid overly permissive `USING (true)` on sensitive tables.

## Risks

- Drizzle migration drift from manual SQL edits → Always use `drizzle-kit generate` for schema changes.
- Missing index causing slow fetch → Use Drizzle's index() helpers or add via custom SQL if needed.
- RLS policy blocking legitimate app access → Test with actual user sessions early.
- Over-normalization of analytics → Start with computed queries; materialize only if slow.

## Type Safety Integration

After migration, Drizzle schema provides full TypeScript types:
```ts
import { db } from '@/db';
import { questions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Fully typed query
const mathQuestions = await db
  .select()
  .from(questions)
  .where(eq(questions.sectionId, sectionId));
// mathQuestions is typed as Question[]
```

No separate type generation needed—Drizzle schema IS your type source.
