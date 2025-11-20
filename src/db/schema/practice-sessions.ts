import { pgTable, uuid, timestamp, integer, text } from 'drizzle-orm/pg-core';
import { users } from './users';
import { sections } from './sections';

/**
 * DEPRECATED: Use user_test_attempts with testType='practice' instead
 * Kept for reference during migration
 */

/**
 * Weak Sections - AI-identified weak areas for spaced repetition
 */
export const weakTopics = pgTable('weak_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => sections.id, { onDelete: 'cascade' }),
  // Performance metrics
  totalAttempts: integer('total_attempts').default(0).notNull(),
  correctAttempts: integer('correct_attempts').default(0).notNull(),
  accuracyPercentage: integer('accuracy_percentage').default(0).notNull(), // 0-100
  // Spaced repetition
  lastPracticedAt: timestamp('last_practiced_at'),
  nextReviewDate: timestamp('next_review_date'),
  reviewCount: integer('review_count').default(0).notNull(),
  // AI analysis
  weaknessLevel: text('weakness_level'), // 'critical', 'moderate', 'improving'
  identifiedAt: timestamp('identified_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Revision Schedule - scheduled practice sessions
 * References user_test_attempts instead of practice_sessions
 */
export const revisionSchedule = pgTable('revision_schedule', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  scheduledDate: timestamp('scheduled_date').notNull(),
  attemptId: uuid('attempt_id'), // Links to user_test_attempts when practice is started
  sectionIds: text('section_ids'), // Comma-separated section IDs
  difficulty: text('difficulty'),
  questionCount: integer('question_count').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
