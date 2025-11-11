import { pgTable, uuid, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'free',
  'active',
  'expired',
  'cancelled',
]);

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

/**
 * Users table - extends Supabase auth.users with profile and subscription info
 * The id should match auth.users.id via triggers/policies
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name'),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('user').notNull(),
  subscriptionStatus: subscriptionStatusEnum('subscription_status')
    .default('free')
    .notNull(),
  subscriptionId: uuid('subscription_id'),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
