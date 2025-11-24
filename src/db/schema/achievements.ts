import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const achievementCategoryEnum = pgEnum('achievement_category', [
  'milestone',
  'performance',
  'streak',
  'coverage',
  'speed'
]);

export const requirementTypeEnum = pgEnum('requirement_type', [
  'tests_count',
  'questions_count',
  'accuracy',
  'streak_days',
  'sections_covered',
  'perfect_score',
  'improvement',
  'consecutive_days'
]);

/**
 * Achievements table - defines all available achievements
 */
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // emoji or icon name
  category: achievementCategoryEnum('category').notNull(),
  requirementType: requirementTypeEnum('requirement_type').notNull(),
  requirementValue: integer('requirement_value').notNull(),
  points: integer('points').default(10).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * User Achievements table - tracks unlocked achievements per user
 */
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  achievementId: uuid('achievement_id')
    .notNull()
    .references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});
