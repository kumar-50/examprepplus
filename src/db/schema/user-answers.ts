import { pgTable, uuid, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { userTestAttempts } from './user-test-attempts';
import { questions } from './questions';

/**
 * User Answers table - individual answers per attempt
 */
export const userAnswers = pgTable('user_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => userTestAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  selectedOption: integer('selected_option'), // 1, 2, 3, 4, or null if unanswered
  isCorrect: boolean('is_correct'),
  isReviewed: boolean('is_reviewed').default(false).notNull(), // Marked for review flag
  timeSpent: integer('time_spent').default(0), // Time spent on this question in seconds
  answeredAt: timestamp('answered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
