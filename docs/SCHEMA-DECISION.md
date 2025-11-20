# Schema Design Decision: Separate vs Unified

## Current Situation

I created **separate schemas** (`practice_sessions` vs `user_test_attempts`), but you're right to question this!

## ✅ RECOMMENDED: Use Unified Schema

### Why Unified is Better:

1. **Already have the foundation**: Your `tests` table already has `testType: 'practice'`
2. **Less complexity**: One table to maintain instead of two
3. **Better analytics**: Easy to compare mock vs practice performance
4. **Code reuse**: Same test engine, just different mode
5. **Simpler queries**: No need to join multiple tables

### What to Change:

#### Option 1: Minimal Changes (Quick Fix)
Keep current structure but make practice sessions reference the tests table:

```typescript
// Create a "dynamic" test record for practice
const practiceTest = await db.insert(tests).values({
  title: "Algebra Practice",
  testType: 'practice',
  totalQuestions: 20,
  duration: 0, // Untimed
  // ... other fields
});

// Then use existing user_test_attempts
const attempt = await db.insert(userTestAttempts).values({
  testId: practiceTest.id,
  userId: user.id,
  // ... rest is the same
});
```

#### Option 2: Extend Existing Schema (Better)
Add practice-specific fields to `user_test_attempts`:

```sql
ALTER TABLE user_test_attempts 
ADD COLUMN practice_topic_ids JSONB,
ADD COLUMN practice_difficulty TEXT,
ADD COLUMN scheduled_for TIMESTAMP;
```

Then drop the `practice_sessions` table entirely.

## My Recommendation

**Use the unified approach** because:

1. Your `tests` table already supports `testType: 'practice'`
2. `user_test_attempts` can handle both with a few extra columns
3. The practice mode differences are mostly **behavioral** (UI), not data structure
4. Spaced repetition and weak topics work the same regardless

### Implementation Plan

1. **For Practice Sessions**:
   - Create test records with `testType: 'practice'`
   - Use `user_test_attempts` for tracking
   - Use `user_answers` for individual responses

2. **For Weak Topics & Scheduling**:
   - Keep separate `weak_topics` table (different purpose)
   - Keep separate `revision_schedule` table (different purpose)
   - These are **meta-data**, not attempt records

3. **What to Drop**:
   - Drop `practice_sessions` table
   - Drop `practice_answers` table (use `user_answers`)

## Quick Migration

If you want to consolidate NOW, here's what to do:

```sql
-- 1. Add fields to user_test_attempts
ALTER TABLE user_test_attempts 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP;

-- 2. Drop practice tables
DROP TABLE IF EXISTS practice_answers;
DROP TABLE IF EXISTS practice_sessions;

-- 3. Done! Use existing tables
```

Then update the code to use `user_test_attempts` instead of `practice_sessions`.

## Final Answer

**Should you have separate schemas?** 

**NO** - Use unified schema because:
- ✅ Less database tables
- ✅ Easier analytics  
- ✅ Simpler codebase
- ✅ Your existing schema already supports it
- ✅ Practice is just a "mode" of test-taking, not a fundamentally different entity

**What should be separate?**

- ✅ `weak_topics` - Different purpose (performance analysis)
- ✅ `revision_schedule` - Different purpose (scheduling)

These are **derived/computed** data, not primary records.
