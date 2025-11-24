import { pgTable, uuid, varchar, decimal, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { sections } from './sections';

export const goalTypeEnum = pgEnum('goal_type', ['daily', 'weekly', 'monthly']);
export const goalCategoryEnum = pgEnum('goal_category', ['questions', 'accuracy', 'time', 'tests', 'sections', 'streak']);
export const goalStatusEnum = pgEnum('goal_status', ['active', 'completed', 'failed', 'archived']);

/**
 * User Goals table - tracks user-defined study goals
 */
export const userGoals = pgTable('user_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  goalType: goalTypeEnum('goal_type').notNull(),
  goalCategory: goalCategoryEnum('goal_category').notNull(),
  targetValue: decimal('target_value', { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 10, scale: 2 }).default('0').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  sectionId: uuid('section_id').references(() => sections.id, { onDelete: 'cascade' }), // NULL for overall goals
  status: goalStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
