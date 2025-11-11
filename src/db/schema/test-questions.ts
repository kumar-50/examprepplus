import { pgTable, uuid, integer, unique } from 'drizzle-orm/pg-core';
import { tests } from './tests';
import { questions } from './questions';
import { sections } from './sections';

/**
 * Test Questions junction table - links tests to questions with ordering
 */
export const testQuestions = pgTable(
  'test_questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    testId: uuid('test_id')
      .notNull()
      .references(() => tests.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    questionOrder: integer('question_order').notNull(), // Display order in test
    marks: integer('marks').notNull(), // Marks for this question in this test
    sectionId: uuid('section_id').references(() => sections.id, { onDelete: 'set null' }),
  },
  (table) => ({
    // Ensure each question appears only once per test
    uniqueTestQuestion: unique().on(table.testId, table.questionId),
  })
);
