import { pgTable, uuid, text, timestamp, boolean, pgEnum, integer, json, real } from 'drizzle-orm/pg-core';
import { users } from './users';

export const testTypeEnum = pgEnum('test_type', ['mock', 'live', 'sectional', 'practice']);

/**
 * Tests table - configuration for mock, live, sectional, and practice tests
 */
export const tests = pgTable('tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  testType: testTypeEnum('test_type').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  totalMarks: integer('total_marks').notNull(),
  duration: integer('duration').notNull(), // in minutes
  negativeMarking: boolean('negative_marking').default(false).notNull(),
  negativeMarkingValue: integer('negative_marking_value').default(0), // e.g., -25 for -0.25 marks (stored as basis points)
  isPublished: boolean('is_published').default(false).notNull(),
  isFree: boolean('is_free').default(false).notNull(),
  bannerImage: text('banner_image'), // URL to test banner image
  instructions: text('instructions'),
  // JSON object for section-wise question distribution
  // Example: { "mathematics": 25, "reasoning": 25, "gk": 30 }
  testPattern: json('test_pattern'),
  // Rating and statistics
  averageRating: real('average_rating').default(0),
  totalRatings: integer('total_ratings').default(0),
  totalAttempts: integer('total_attempts').default(0),
  // For live tests - scheduled date/time
  scheduledAt: timestamp('scheduled_at'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
