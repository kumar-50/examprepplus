import { pgTable, uuid, timestamp, integer, varchar, date, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * User Usage - Track feature usage for access control
 * This table tracks daily/monthly usage of limited features for free tier users
 */
export const userUsage = pgTable('user_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // User reference
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Feature being tracked (e.g., 'mock_tests', 'practice_questions', 'explanations')
  feature: varchar('feature', { length: 50 }).notNull(),
  
  // Period type: 'daily', 'monthly', 'total'
  period: varchar('period', { length: 20 }).notNull(),
  
  // Period date - for daily: the specific date, for monthly: first day of month
  // For 'total', this can be null or set to a fixed reference date
  periodDate: date('period_date'),
  
  // Usage count within the period
  count: integer('count').default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Index for fast lookups by user and feature
  index('user_usage_user_feature_idx').on(table.userId, table.feature),
  
  // Unique constraint: one record per user, feature, period, periodDate
  uniqueIndex('user_usage_unique_idx').on(table.userId, table.feature, table.period, table.periodDate),
]);

// Type exports
export type UserUsage = typeof userUsage.$inferSelect;
export type NewUserUsage = typeof userUsage.$inferInsert;
