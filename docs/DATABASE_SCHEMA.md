# Database Schema Documentation

## Overview

ExamPrepPlus uses PostgreSQL (via Supabase) with Drizzle ORM for type-safe database access.

## Schema Location

All schema definitions are in `src/db/schema/`:

```
src/db/
├── schema/
│   ├── index.ts                    # Exports all schemas
│   ├── users.ts                    # User profiles
│   ├── sections.ts                 # Exam sections
│   ├── topics.ts                   # Section topics
│   ├── questions.ts                # Question bank
│   ├── tests.ts                    # Test configurations
│   ├── test-questions.ts           # Test-Question junction
│   ├── user-test-attempts.ts       # Test attempts
│   ├── user-answers.ts             # Individual answers
│   ├── subscription-plans.ts       # Subscription tiers
│   ├── subscriptions.ts            # User subscriptions
│   ├── coupons.ts                  # Discount codes
│   └── coupon-usage.ts             # Coupon redemptions
└── index.ts                        # Drizzle client
```

## Tables

### users
User profiles extending Supabase auth.
- `id` - UUID (matches auth.users.id)
- `fullName`, `email`, `phone`, `avatarUrl`
- `role` - ENUM: user | admin
- `subscriptionStatus` - ENUM: free | active | expired | cancelled
- `subscriptionId` - FK to subscriptions
- `isActive` - Account status
- `lastLoginAt`, `createdAt`, `updatedAt`

### sections
Top-level exam categories (e.g., Mathematics, Reasoning).
- `id` - UUID
- `name`, `description`
- `displayOrder` - Sort order
- `examType` - ENUM: RRB_NTPC | SSC_CGL | BANK_PO | OTHER
- `createdAt`

### topics
Sub-categories within sections (e.g., Algebra, Data Interpretation).
- `id` - UUID
- `name`, `description`
- `sectionId` - FK to sections (cascade delete)
- `createdAt`

### questions
Question bank with multiple-choice questions.
- `id` - UUID
- `questionText` - Question content
- `option1`, `option2`, `option3`, `option4` - Answer choices
- `correctOption` - Integer (1-4)
- `explanation` - Answer explanation
- `sectionId` - FK to sections (cascade delete)
- `topicId` - FK to topics (set null on delete)
- `difficultyLevel` - ENUM: easy | medium | hard
- `hasEquation` - Boolean flag for LaTeX
- `imageUrl` - Optional question image
- `createdBy` - FK to users
- `isActive` - Soft delete flag
- `createdAt`, `updatedAt`

### tests
Test configurations for mock, live, sectional, and practice tests.
- `id` - UUID
- `title`, `description`
- `testType` - ENUM: mock | live | sectional | practice
- `totalQuestions`, `totalMarks`, `duration` (minutes)
- `negativeMarking` - Boolean
- `negativeMarkingValue` - Integer (basis points, e.g., -25 = -0.25)
- `isPublished`, `isFree` - Boolean flags
- `instructions` - Text
- `testPattern` - JSON (section-wise distribution)
- `scheduledAt` - For live tests
- `createdBy` - FK to users
- `createdAt`, `updatedAt`

### test_questions
Junction table linking tests to questions.
- `id` - UUID
- `testId` - FK to tests (cascade delete)
- `questionId` - FK to questions (cascade delete)
- `questionOrder` - Display sequence
- `marks` - Points for this question
- `sectionId` - FK to sections
- UNIQUE constraint on (testId, questionId)

### user_test_attempts
Records of user test sessions.
- `id` - UUID
- `userId` - FK to users (cascade delete)
- `testId` - FK to tests (cascade delete)
- `status` - ENUM: in_progress | submitted | auto_submitted
- `score`, `totalMarks`
- `correctAnswers`, `incorrectAnswers`, `unanswered` - Counts
- `sectionBreakdown`, `topicBreakdown` - JSON
- `timeSpent` - Seconds
- `startedAt`, `submittedAt`
- `rank`, `percentile` - For live tests (basis points)

### user_answers
Individual answers within an attempt.
- `id` - UUID
- `attemptId` - FK to user_test_attempts (cascade delete)
- `questionId` - FK to questions (cascade delete)
- `selectedOption` - Integer (1-4) or null
- `isCorrect` - Boolean
- `isReviewed` - Marked for review flag
- `timeSpent` - Seconds on this question
- `answeredAt`, `createdAt`

### subscription_plans
Available subscription tiers.
- `id` - UUID
- `name`, `description`
- `price` - Integer (paise/cents)
- `currency` - Default INR
- `durationDays` - Validity period
- `features` - Text (JSON or comma-separated)
- `isActive` - Boolean
- `displayOrder` - Sort order
- `createdAt`, `updatedAt`

### subscriptions
User subscription purchases.
- `id` - UUID
- `userId` - FK to users (cascade delete)
- `planId` - FK to subscription_plans (restrict delete)
- `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`
- `paymentStatus` - ENUM: pending | completed | failed | refunded
- `startDate`, `endDate`
- `createdAt`, `updatedAt`

### coupons
Discount codes.
- `id` - UUID
- `code` - Unique text
- `description`
- `discountType` - Text: percentage | fixed
- `discountValue` - Integer (percentage or paise)
- `maxUses` - Null = unlimited
- `usedCount` - Current usage
- `validFrom`, `validUntil`
- `isActive` - Boolean
- `createdAt`, `updatedAt`

### coupon_usage
Coupon redemption tracking.
- `id` - UUID
- `couponId` - FK to coupons (cascade delete)
- `userId` - FK to users (cascade delete)
- `subscriptionId` - FK to subscriptions (set null)
- `discountApplied` - Integer (paise)
- `usedAt`

## Enums

```typescript
user_role: 'user' | 'admin'
subscription_status: 'free' | 'active' | 'expired' | 'cancelled'
exam_type: 'RRB_NTPC' | 'SSC_CGL' | 'BANK_PO' | 'OTHER'
difficulty_level: 'easy' | 'medium' | 'hard'
test_type: 'mock' | 'live' | 'sectional' | 'practice'
attempt_status: 'in_progress' | 'submitted' | 'auto_submitted'
payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
```

## Relationships

- **sections** → **topics** (one-to-many)
- **sections** → **questions** (one-to-many)
- **topics** → **questions** (one-to-many)
- **tests** ↔ **questions** (many-to-many via test_questions)
- **users** → **user_test_attempts** (one-to-many)
- **tests** → **user_test_attempts** (one-to-many)
- **user_test_attempts** → **user_answers** (one-to-many)
- **users** → **subscriptions** (one-to-many)
- **subscription_plans** → **subscriptions** (one-to-many)
- **coupons** → **coupon_usage** (one-to-many)

## Usage Example

```typescript
import { db } from '@/db';
import { questions, sections } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Fetch all questions from a section
const mathQuestions = await db
  .select()
  .from(questions)
  .where(eq(questions.sectionId, sectionId));

// Create a new section
const newSection = await db
  .insert(sections)
  .values({
    name: 'Mathematics',
    description: 'Math questions',
    displayOrder: 1,
    examType: 'RRB_NTPC',
  })
  .returning();
```

## Migration Commands

```bash
# Generate migration after schema changes
npm run db:generate

# Push schema to database (dev)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open visual database browser
npm run db:studio
```
