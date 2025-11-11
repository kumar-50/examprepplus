import { pgTable, uuid, text, timestamp, boolean, pgEnum, integer } from 'drizzle-orm/pg-core';
import { sections } from './sections';
import { topics } from './topics';
import { users } from './users';

export const difficultyLevelEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard']);
export const questionStatusEnum = pgEnum('question_status', ['pending', 'approved', 'rejected']);

/**
 * Questions table - the main question bank
 */
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionText: text('question_text').notNull(),
  option1: text('option_1').notNull(),
  option2: text('option_2').notNull(),
  option3: text('option_3').notNull(),
  option4: text('option_4').notNull(),
  correctOption: integer('correct_option').notNull(), // 1, 2, 3, or 4
  explanation: text('explanation'),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => sections.id, { onDelete: 'cascade' }),
  topicId: uuid('topic_id').references(() => topics.id, { onDelete: 'set null' }),
  difficultyLevel: difficultyLevelEnum('difficulty_level').default('medium').notNull(),
  hasEquation: boolean('has_equation').default(false).notNull(),
  imageUrl: text('image_url'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true).notNull(),
  // Question verification fields
  status: questionStatusEnum('status').default('pending').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
