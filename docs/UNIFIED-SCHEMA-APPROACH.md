/**
 * ALTERNATIVE APPROACH: Unified Test/Practice Schema
 * 
 * This consolidates both test attempts and practice sessions into one schema
 * using the existing `test_type` enum to differentiate behavior.
 */

import { pgTable, uuid, timestamp, integer, json, boolean, text } from 'drizzle-orm/pg-core';
import { users, tests } from './schema';

/**
 * Extended test type to include practice
 */
// Modify the existing testTypeEnum to include 'practice'
// export const testTypeEnum = pgEnum('test_type', ['mock', 'live', 'sectional', 'practice']);

/**
 * UNIFIED APPROACH: Use existing user_test_attempts table for both
 * 
 * Benefits:
 * - Single source of truth for all user attempts
 * - Easier analytics (compare mock vs practice performance)
 * - Less database tables to maintain
 * - Simpler queries
 */

/**
 * Extend user_test_attempts with optional practice-specific fields
 */
export const userTestAttemptsExtended = pgTable('user_test_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  testId: uuid('test_id').references(() => tests.id), // NULL for dynamic practice sessions
  
  // Test type determines behavior
  testType: text('test_type').notNull(), // 'mock' | 'live' | 'sectional' | 'practice'
  
  status: text('status').notNull(), // 'in_progress' | 'submitted'
  
  // Scores (used by all types)
  score: integer('score'),
  totalMarks: integer('total_marks').notNull(),
  correctAnswers: integer('correct_answers').default(0),
  incorrectAnswers: integer('incorrect_answers').default(0),
  unanswered: integer('unanswered').default(0),
  
  // PRACTICE-SPECIFIC FIELDS (only used when testType = 'practice')
  practiceTitle: text('practice_title'), // "Algebra Practice Quiz"
  practiceTopicIds: json('practice_topic_ids').$type<string[]>(), // Selected topics
  practiceDifficulty: text('practice_difficulty'), // 'easy' | 'medium' | 'hard'
  scheduledFor: timestamp('scheduled_for'), // For spaced repetition
  
  // TEST-SPECIFIC FIELDS (only used when testType != 'practice')
  rank: integer('rank'),
  percentile: integer('percentile'),
  
  // SHARED FIELDS
  sectionBreakdown: json('section_breakdown'),
  topicBreakdown: json('topic_breakdown'),
  timeSpent: integer('time_spent'),
  
  startedAt: timestamp('started_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
});

/**
 * User answers work the same for both
 * Just reference the unified user_test_attempts
 */

/**
 * USAGE EXAMPLES
 */

// Creating a practice session
const practiceSession = await db.insert(userTestAttempts).values({
  userId: user.id,
  testId: null, // No predefined test
  testType: 'practice',
  practiceTitle: 'Algebra Improvement',
  practiceTopicIds: ['topic-1', 'topic-2'],
  practiceDifficulty: 'medium',
  totalMarks: 20,
  status: 'in_progress',
});

// Creating a mock test attempt
const mockTest = await db.insert(userTestAttempts).values({
  userId: user.id,
  testId: 'test-uuid',
  testType: 'mock',
  totalMarks: 100,
  status: 'in_progress',
});

// Query all practice sessions
const practices = await db
  .select()
  .from(userTestAttempts)
  .where(
    and(
      eq(userTestAttempts.userId, userId),
      eq(userTestAttempts.testType, 'practice')
    )
  );

// Query all test attempts (excluding practice)
const tests = await db
  .select()
  .from(userTestAttempts)
  .where(
    and(
      eq(userTestAttempts.userId, userId),
      inArray(userTestAttempts.testType, ['mock', 'live', 'sectional'])
    )
  );

/**
 * BENEFITS OF UNIFIED SCHEMA:
 * 
 * 1. Single analytics query for all user activity
 * 2. Easier to compare mock vs practice performance
 * 3. Less code duplication
 * 4. Simpler database maintenance
 * 5. Can reuse existing test engine with mode flag
 * 6. Historical data in one place
 * 
 * TRADE-OFFS:
 * 
 * 1. More NULL fields (practice fields NULL for tests, test fields NULL for practice)
 * 2. Slightly more complex queries (need to filter by testType)
 * 3. Table can grow larger (but this is usually fine)
 */

/**
 * MIGRATION STRATEGY:
 * 
 * If you want to use this unified approach instead:
 * 
 * 1. Add practice-specific columns to user_test_attempts
 * 2. Update testType enum to include 'practice'
 * 3. Drop the separate practice_sessions table
 * 4. Use the same user_answers table for both
 * 5. Update components to check testType
 */
