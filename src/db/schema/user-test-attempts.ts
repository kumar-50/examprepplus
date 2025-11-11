import { pgTable, uuid, timestamp, pgEnum, integer, json, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { tests } from './tests';

export const attemptStatusEnum = pgEnum('attempt_status', [
  'in_progress',
  'submitted',
  'auto_submitted',
]);

/**
 * User Test Attempts table - tracks each test session
 */
export const userTestAttempts = pgTable('user_test_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  testId: uuid('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  status: attemptStatusEnum('status').default('in_progress').notNull(),
  score: integer('score'), // Total score achieved
  totalMarks: integer('total_marks').notNull(), // Maximum possible marks
  correctAnswers: integer('correct_answers').default(0),
  incorrectAnswers: integer('incorrect_answers').default(0),
  unanswered: integer('unanswered').default(0),
  // JSON object with section-wise breakdown
  // Example: { "mathematics": { "correct": 20, "incorrect": 3, "unanswered": 2 }, ... }
  sectionBreakdown: json('section_breakdown'),
  // JSON object with topic-wise breakdown  
  topicBreakdown: json('topic_breakdown'),
  timeSpent: integer('time_spent'), // Total time spent in seconds
  startedAt: timestamp('started_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
  // For live tests - rank/percentile
  rank: integer('rank'),
  percentile: integer('percentile'), // stored as basis points (9525 = 95.25%)
});
