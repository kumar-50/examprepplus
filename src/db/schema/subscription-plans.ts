import { pgTable, uuid, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * Subscription Plans table - defines available subscription tiers
 */
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g., "Basic", "Premium", "Ultimate"
  description: text('description'),
  price: integer('price').notNull(), // Price in paise/cents (e.g., 49900 = ₹499)
  currency: text('currency').default('INR').notNull(),
  durationDays: integer('duration_days').notNull(), // Validity period in days
  features: text('features'), // JSON string or comma-separated list
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
