# Practice Mode Schema Refactoring

## Overview
Refactored practice mode from using separate tables to unified schema approach that reuses existing test infrastructure.

## Previous Design (Deprecated)
- Separate `practice_sessions` table
- Separate `practice_answers` table
- Duplication of logic and data structures

## New Design (Unified Schema)
Practice mode now uses existing tables:
- **tests** table with `testType='practice'`
- **user_test_attempts** for tracking sessions
- **user_answers** for individual responses
- **test_questions** for question links

Separate tables kept for meta-data:
- **weak_topics** - performance analysis
- **revision_schedule** - scheduling metadata

## Key Changes

### Database Schema
1. Added `scheduled_for` field to `user_test_attempts`
2. Removed `practice_sessions` table
3. Removed `practice_answers` table
4. Updated `revision_schedule`:
   - Changed `topic_ids` from JSONB to TEXT (comma-separated)
   - Changed `is_completed` to `attempt_id` (FK to user_test_attempts)
   - Removed `session_id` reference

### API Routes

#### `/api/practice/generate`
**Before:** Created practice_sessions record
**After:** Creates test record + user_test_attempts record
```typescript
const test = await db.insert(tests).values({
  title,
  testType: 'practice',
  duration: 0,
  testPattern: JSON.stringify({ topicIds, difficulty }),
  // ...
});

const attempt = await db.insert(userTestAttempts).values({
  userId,
  testId: test.id,
  scheduledFor,
  // ...
});
```

#### `/api/practice/answer`
**Before:** Saved to practice_answers
**After:** Saves to user_answers via test_questions
```typescript
const testQuestion = await db.query.testQuestions.findFirst({
  where: and(
    eq(testQuestions.testId, attemptData.testId),
    eq(testQuestions.questionId, questionId)
  )
});

await db.insert(userAnswers).values({
  attemptId,
  testQuestionId: testQuestion.id,
  selectedOption,
  // ...
});
```

#### `/api/practice/complete`
**Before:** Updated practice_sessions.isCompleted
**After:** Updates user_test_attempts.status
```typescript
await db.update(userTestAttempts)
  .set({
    status: 'submitted',
    submittedAt: new Date(),
    // ...
  })
  .where(eq(userTestAttempts.id, attemptId));
```

### Components

#### `spaced-repetition-queue.tsx`
- Changed query to join with user_test_attempts
- Uses `attemptId IS NOT NULL` instead of `isCompleted=true`

#### `revision-history.tsx`
- Queries `user_test_attempts` + `tests` instead of `practice_sessions`
- Uses `submittedAt` instead of `completedAt`

#### `revision-calendar.tsx`
- Checks `attemptId` for completion instead of `isCompleted`

#### `practice-attempt-engine.tsx`
- No changes needed (UI-only component)

### Pages

#### `/dashboard/practice/page.tsx`
- Queries user_test_attempts filtered by `testType='practice'`
- Joins with tests table for metadata

#### `/dashboard/practice/session/[sessionId]/page.tsx`
- Fetches from user_test_attempts + tests
- Extracts topicIds from `test.testPattern` JSON
- Queries questions based on topics

## Benefits

1. **No Duplication:** Reuses existing test infrastructure
2. **Consistency:** Mock and practice tests stored same way
3. **Simpler Code:** Less schema to maintain
4. **Future-Proof:** Easy to add new test types

## Differences Between Mock and Practice

Differences are **behavioral** (UI/logic), not **structural** (database):

| Feature | Mock Test | Practice Test |
|---------|-----------|---------------|
| Timer | ✅ Strict | ❌ No timer |
| Feedback | After submission | Immediate |
| Navigation | Linear | Jump to any question |
| Explanations | After submit | Auto-shown |
| Scoring | Final score only | Running score |
| Duration | Required | 0 (ignored) |

## Migration Steps

1. Run migration SQL to add `scheduled_for` column
2. Create weak_topics and revision_schedule tables
3. No data migration needed (practice is new feature)

## Future Integration

When user submits a mock test, update weak topics:
```typescript
// In your test submission handler
import { analyzeWeakTopicsAction } from '@/lib/analytics/weak-topic-analyzer';

// After test is saved
await analyzeWeakTopicsAction(userId, attemptId);
```

## Files Modified
- `src/db/schema/practice-sessions.ts` - Deprecated old tables
- `src/db/schema/user-test-attempts.ts` - Added scheduledFor
- `src/app/api/practice/generate/route.ts` - Use tests table
- `src/app/api/practice/answer/route.ts` - Use user_answers
- `src/app/api/practice/complete/route.ts` - Use user_test_attempts
- `src/app/dashboard/practice/page.tsx` - Query user_test_attempts
- `src/app/dashboard/practice/session/[sessionId]/page.tsx` - Refactored
- `src/components/practice/spaced-repetition-queue.tsx` - Updated queries
- `src/components/practice/revision-history.tsx` - Updated queries
- `src/components/practice/revision-calendar.tsx` - Updated completion check
- `migrations/add-practice-mode-tables.sql` - Updated migration

## Testing Checklist

- [ ] Generate practice quiz from weak topics
- [ ] Generate custom quiz (topic selection)
- [ ] Answer questions with immediate feedback
- [ ] Complete practice session
- [ ] View in revision history
- [ ] Schedule appears in spaced repetition queue
- [ ] Calendar shows scheduled/completed sessions
- [ ] Weak topic analysis updates after mock test
