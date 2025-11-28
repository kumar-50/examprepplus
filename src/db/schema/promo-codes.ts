import { pgTable, uuid, text, varchar, integer, boolean, timestamp, json } from 'drizzle-orm/pg-core';
import { subscriptionPlans } from './subscription-plans';

/**
 * Promo codes table - discount codes for subscriptions
 */
export const promoCodes = pgTable('promo_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Promo code details
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  
  // Discount configuration
  discountType: varchar('discount_type', { length: 20 }).notNull().default('percentage'), // 'percentage' or 'fixed'
  discountValue: integer('discount_value').notNull(), // percentage (e.g., 50) or fixed amount in paise
  
  // Applicability - supports multiple plans
  applicablePlanId: uuid('applicable_plan_id').references(() => subscriptionPlans.id, { onDelete: 'set null' }), // deprecated, kept for backward compatibility
  applicablePlanIds: json('applicable_plan_ids').$type<string[]>(), // Array of plan IDs, null = all plans
  
  // Limits
  maxUses: integer('max_uses'), // null = unlimited
  currentUses: integer('current_uses').notNull().default(0),
  maxUsesPerUser: integer('max_uses_per_user').notNull().default(1),
  
  // Validity
  validFrom: timestamp('valid_from').defaultNow().notNull(),
  validUntil: timestamp('valid_until'),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  
  // Global promo settings
  isGlobal: boolean('is_global').notNull().default(false), // If true, auto-applied to pricing
  appliedBy: varchar('applied_by', { length: 10 }).notNull().default('user'), // 'admin' or 'user'
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Promo code usage tracking
 */
export const promoCodeUsages = pgTable('promo_code_usages', {
  id: uuid('id').primaryKey().defaultRandom(),
  promoCodeId: uuid('promo_code_id')
    .notNull()
    .references(() => promoCodes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  subscriptionId: uuid('subscription_id'),
  discountApplied: integer('discount_applied').notNull(), // Amount discounted in paise
  usedAt: timestamp('used_at').defaultNow().notNull(),
});
