import { db } from '@/db';
import { subscriptionPlans, subscriptions, users, userAnswers } from '@/db/schema';
import { eq, and, gt, desc, gte, count, sql } from 'drizzle-orm';

/**
 * Subscription utility functions
 */

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
}

/**
 * Get user's current active subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  try {
    // Get the most recent completed subscription
    const result = await db
      .select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        planName: subscriptionPlans.name,
        paymentStatus: subscriptions.paymentStatus,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.paymentStatus, 'completed')
        )
      )
      .orderBy(desc(subscriptions.endDate)) // Get the one that expires latest
      .limit(1);

    if (result.length === 0 || !result[0]) {
      return null;
    }

    const sub = result[0];
    const now = new Date();
    const isActive =
      sub.endDate !== null && new Date(sub.endDate) > now;

    return {
      id: sub.id,
      planId: sub.planId,
      planName: sub.planName,
      status: isActive ? 'active' : 'expired',
      startDate: sub.startDate,
      endDate: sub.endDate,
      isActive,
    };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription?.isActive || false;
}

/**
 * Get subscription plan by ID
 */
export async function getSubscriptionPlan(planId: string) {
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  return plan || null;
}

/**
 * Get all active subscription plans
 */
export async function getAllSubscriptionPlans() {
  return await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.displayOrder);
}

/**
 * Calculate subscription end date based on duration
 */
export function calculateEndDate(startDate: Date, durationDays: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
}

/**
 * Get free tier usage limits
 */
export const FREE_TIER_LIMITS = {
  mockTests: 5, // 5 full mock tests
  practiceQuestionsPerDay: 50, // 50 practice questions per day
  analyticsHistoryDays: 7, // 7 days of analytics
} as const;

/**
 * Check if user has reached free tier limit for mock tests
 */
export async function hasReachedMockTestLimit(userId: string): Promise<boolean> {
  const hasSubscription = await hasActiveSubscription(userId);
  
  if (hasSubscription) {
    return false; // Unlimited for paid users
  }

  // Count completed tests for free users
  const { count } = await db.query.userTestAttempts.findMany({
    where: (attempts, { eq, and }) => 
      and(
        eq(attempts.userId, userId),
        eq(attempts.status, 'submitted')
      ),
  }).then(attempts => ({ count: attempts.length }));

  return count >= FREE_TIER_LIMITS.mockTests;
}

/**
 * Check if user has reached practice questions limit today
 */
export async function hasReachedPracticeLimit(userId: string): Promise<boolean> {
  const hasSubscription = await hasActiveSubscription(userId);
  
  if (hasSubscription) {
    return false; // Unlimited for paid users
  }

  // Get today's start (midnight)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Count practice questions answered today
  const result = await db
    .select({ count: count() })
    .from(userAnswers)
    .where(
      and(
        eq(userAnswers.attemptId, sql`(SELECT id FROM user_test_attempts WHERE user_id = ${userId} AND test_type = 'practice' LIMIT 1)`),
        gte(userAnswers.answeredAt, todayStart)
      )
    );

  const countValue = result[0]?.count || 0;

  return countValue >= FREE_TIER_LIMITS.practiceQuestionsPerDay;
}

/**
 * Get remaining free tier usage
 */
export async function getRemainingFreeUsage(userId: string) {
  const hasSubscription = await hasActiveSubscription(userId);
  
  if (hasSubscription) {
    return {
      mockTests: Infinity,
      practiceQuestions: Infinity,
      isUnlimited: true,
    };
  }

  // Count completed tests
  const testCount = await db.query.userTestAttempts
    .findMany({
      where: (attempts, { eq, and }) =>
        and(
          eq(attempts.userId, userId),
          eq(attempts.status, 'submitted')
        ),
    })
    .then(attempts => attempts.length);

  // Count practice questions today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  // Count questions answered today from practice test attempts
  const practiceResult = await db
    .select({ count: count() })
    .from(userAnswers)
    .innerJoin(
      sql`user_test_attempts`,
      sql`${userAnswers.attemptId} = user_test_attempts.id AND user_test_attempts.user_id = ${userId} AND user_test_attempts.test_type = 'practice'`
    )
    .where(gte(userAnswers.answeredAt, todayStart));

  const practiceCount = practiceResult[0]?.count || 0;

  return {
    mockTests: Math.max(0, FREE_TIER_LIMITS.mockTests - testCount),
    practiceQuestions: Math.max(
      0,
      FREE_TIER_LIMITS.practiceQuestionsPerDay - practiceCount
    ),
    isUnlimited: false,
  };
}

/**
 * Update user's subscription status in users table
 */
export async function updateUserSubscriptionStatus(
  userId: string,
  status: 'free' | 'active' | 'expired' | 'cancelled'
) {
  await db
    .update(users)
    .set({
      subscriptionStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
