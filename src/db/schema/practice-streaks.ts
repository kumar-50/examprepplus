import { pgTable, uuid, timestamp, integer, date, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Practice Streaks - Track consecutive days of practice
 */
export const practiceStreaks = pgTable('practice_streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  // Current streak
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  // Dates
  lastPracticeDate: date('last_practice_date'),
  streakStartDate: date('streak_start_date'),
  // Totals
  totalPracticeDays: integer('total_practice_days').default(0).notNull(),
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Practice Calendar - Track individual practice days for calendar visualization
 */
export const practiceCalendar = pgTable('practice_calendar', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  practiceDate: date('practice_date').notNull(),
  // Stats for the day
  questionsAnswered: integer('questions_answered').default(0).notNull(),
  correctAnswers: integer('correct_answers').default(0).notNull(),
  practiceMinutes: integer('practice_minutes').default(0).notNull(),
  sessionsCompleted: integer('sessions_completed').default(0).notNull(),
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
