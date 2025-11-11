import { pgTable, uuid, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * Coupons table - discount codes for subscriptions
 */
export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountType: text('discount_type').notNull(), // 'percentage' or 'fixed'
  discountValue: integer('discount_value').notNull(), // Percentage (0-100) or amount in paise
  maxUses: integer('max_uses'), // null = unlimited
  usedCount: integer('used_count').default(0).notNull(),
  validFrom: timestamp('valid_from').defaultNow().notNull(),
  validUntil: timestamp('valid_until'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
