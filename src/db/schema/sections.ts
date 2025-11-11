import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const examTypeEnum = pgEnum('exam_type', [
  'RRB_NTPC',
  'SSC_CGL',
  'BANK_PO',
  'OTHER',
]);

/**
 * Sections table - top-level exam categories
 * Examples: Mathematics, Reasoning, General Knowledge
 */
export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  examType: examTypeEnum('exam_type').default('RRB_NTPC').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
