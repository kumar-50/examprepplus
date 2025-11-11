import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { coupons } from './coupons';
import { subscriptions } from './subscriptions';

/**
 * Coupon Usage table - tracks coupon redemptions
 */
export const couponUsage = pgTable('coupon_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id')
    .notNull()
    .references(() => coupons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, {
    onDelete: 'set null',
  }),
  discountApplied: integer('discount_applied').notNull(), // Actual discount amount in paise
  usedAt: timestamp('used_at').defaultNow().notNull(),
});
