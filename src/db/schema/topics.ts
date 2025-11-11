import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { sections } from './sections';

/**
 * Topics table - sub-categories within sections
 * Examples: Algebra, Data Interpretation, Indian History
 */
export const topics = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => sections.id, { onDelete: 'cascade' }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
