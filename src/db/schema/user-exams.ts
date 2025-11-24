import { pgTable, uuid, varchar, date, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * User Exams table - tracks scheduled exam dates
 */
export const userExams = pgTable('user_exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  examName: varchar('exam_name', { length: 200 }).notNull(),
  examDate: date('exam_date').notNull(),
  targetScore: integer('target_score'), // Optional target score percentage
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
