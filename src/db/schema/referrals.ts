import { pgTable, uuid, varchar, timestamp, integer, boolean, text } from 'drizzle-orm/pg-core';
import { users } from './users';
import { subscriptions } from './subscriptions';

/**
 * Referrals table - Track user referrals
 */
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: uuid('referred_user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  referralCode: varchar('referral_code', { length: 20 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, completed, rewarded
  rewardType: varchar('reward_type', { length: 50 }), // free_month, discount, etc
  rewardApplied: boolean('reward_applied').default(false),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
  metadata: text('metadata'), // JSON data for additional info
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

/**
 * Payment analytics table - Track payment events
 */
export const paymentAnalytics = pgTable('payment_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
  event: varchar('event', { length: 50 }).notNull(), // payment_initiated, payment_success, payment_failed, etc
  planId: uuid('plan_id'),
  amount: integer('amount'), // in paise
  currency: varchar('currency', { length: 3 }).default('INR'),
  paymentMethod: varchar('payment_method', { length: 50 }), // upi, card, netbanking, etc
  razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
  errorCode: varchar('error_code', { length: 50 }),
  errorMessage: text('error_message'),
  metadata: text('metadata'), // JSON for additional data
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
