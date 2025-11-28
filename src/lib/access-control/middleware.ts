/**
 * Access Control Middleware
 * Server-side functions for checking and managing feature access
 */

import { db } from '@/db';
import { userUsage } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { hasActiveSubscription } from '@/lib/subscription-utils';
import { FeatureKey, SubscriptionTier, AccessCheckResult, LimitPeriod, UsageStats } from './types';
import { getFeatureAccess, isFeatureEnabled, getFeatureLimit, isUnlimited, FEATURE_NAMES } from './config';

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const hasSub = await hasActiveSubscription(userId);
  return hasSub ? 'premium' : 'free';
}

/**
 * Get the period date for usage tracking
 */
function getPeriodDate(period: LimitPeriod): string {
  const now = new Date();
  const dateStr = now.toISOString().substring(0, 10); // YYYY-MM-DD format
  
  switch (period) {
    case 'daily':
      return dateStr;
    case 'weekly':
      // Get the start of the week (Monday)
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday is day 0
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      return monday.toISOString().substring(0, 10);
    case 'monthly':
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    case 'total':
      return '2024-01-01'; // Fixed reference date for total counts
    default:
      return dateStr;
  }
}

/**
 * Get current usage for a feature
 */
export async function getUsage(
  userId: string,
  feature: FeatureKey,
  period: LimitPeriod
): Promise<number> {
  try {
    const periodDate = getPeriodDate(period);
    
    const result = await db
      .select({ count: userUsage.count })
      .from(userUsage)
      .where(
        and(
          eq(userUsage.userId, userId),
          eq(userUsage.feature, feature),
          eq(userUsage.period, period),
          eq(userUsage.periodDate, periodDate)
        )
      )
      .limit(1);

    if (result.length > 0) {
      const firstResult = result[0];
      return firstResult?.count ?? 0;
    }
    return 0;
  } catch (error) {
    console.error(`Error getting usage for ${feature}:`, error);
    return 0;
  }
}

/**
 * Increment usage for a feature
 */
export async function incrementUsage(
  userId: string,
  feature: FeatureKey,
  period: LimitPeriod,
  incrementBy: number = 1
): Promise<number> {
  try {
    const periodDate = getPeriodDate(period);
    
    // Upsert: insert or update on conflict
    const result = await db
      .insert(userUsage)
      .values({
        userId,
        feature,
        period,
        periodDate,
        count: incrementBy,
      })
      .onConflictDoUpdate({
        target: [userUsage.userId, userUsage.feature, userUsage.period, userUsage.periodDate],
        set: {
          count: sql`${userUsage.count} + ${incrementBy}`,
          updatedAt: new Date(),
        },
      })
      .returning({ count: userUsage.count });

    return result[0]?.count ?? incrementBy;
  } catch (error) {
    console.error(`Error incrementing usage for ${feature}:`, error);
    return 0;
  }
}

/**
 * Check if user can access a feature
 */
export async function checkAccess(
  userId: string,
  feature: FeatureKey
): Promise<AccessCheckResult> {
  try {
    const tier = await getUserTier(userId);
    
    // Check if feature is enabled for this tier
    if (!isFeatureEnabled(tier, feature)) {
      return {
        allowed: false,
        reason: `${FEATURE_NAMES[feature]} is a premium-only feature`,
        upgradeRequired: true,
      };
    }

    // Check if unlimited
    if (isUnlimited(tier, feature)) {
      return {
        allowed: true,
        remaining: -1, // Unlimited
      };
    }

    // Get the limit and period
    const access = getFeatureAccess(tier, feature);
    const limit = access.limits?.limit ?? -1;
    const period = access.limits?.period ?? 'daily';

    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    // Get current usage
    const used = await getUsage(userId, feature, period);
    const remaining = Math.max(0, limit - used);

    if (remaining === 0) {
      return {
        allowed: false,
        reason: `You've reached your ${period} limit for ${FEATURE_NAMES[feature]}`,
        remaining: 0,
        limit,
        used,
        upgradeRequired: true,
        period,
      };
    }

    return {
      allowed: true,
      remaining,
      limit,
      used,
      period,
    };
  } catch (error) {
    console.error(`Error checking access for ${feature}:`, error);
    // Fail open - allow access if there's an error
    return { allowed: true };
  }
}

/**
 * Use a feature (check access + increment usage)
 * Returns the result of the access check after incrementing
 */
export async function useFeature(
  userId: string,
  feature: FeatureKey,
  count: number = 1
): Promise<AccessCheckResult> {
  try {
    const tier = await getUserTier(userId);
    
    // Check if feature is enabled for this tier
    if (!isFeatureEnabled(tier, feature)) {
      return {
        allowed: false,
        reason: `${FEATURE_NAMES[feature]} is a premium-only feature`,
        upgradeRequired: true,
      };
    }

    // Check if unlimited - still track usage but don't enforce limits
    if (isUnlimited(tier, feature)) {
      // For premium users, we might still want to track usage for analytics
      // but we don't need to enforce limits
      return {
        allowed: true,
        remaining: -1,
      };
    }

    // Get the limit and period
    const access = getFeatureAccess(tier, feature);
    const limit = access.limits?.limit ?? -1;
    const period = access.limits?.period ?? 'daily';

    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    // Get current usage
    const currentUsage = await getUsage(userId, feature, period);
    
    // Check if adding this usage would exceed the limit
    if (currentUsage + count > limit) {
      const remaining = Math.max(0, limit - currentUsage);
      return {
        allowed: false,
        reason: `You've reached your ${period} limit for ${FEATURE_NAMES[feature]}`,
        remaining,
        limit,
        used: currentUsage,
        upgradeRequired: true,
        period,
      };
    }

    // Increment usage
    const newUsage = await incrementUsage(userId, feature, period, count);
    const remaining = Math.max(0, limit - newUsage);

    return {
      allowed: true,
      remaining,
      limit,
      used: newUsage,
      period,
    };
  } catch (error) {
    console.error(`Error using feature ${feature}:`, error);
    // Fail open
    return { allowed: true };
  }
}

/**
 * Get usage statistics for all features for a user
 */
export async function getAllUsageStats(userId: string): Promise<Record<FeatureKey, UsageStats>> {
  const tier = await getUserTier(userId);
  const features: FeatureKey[] = [
    'mock_tests',
    'practice_questions',
    'topic_access',
    'analytics_history',
    'test_history',
    'explanations',
    'weak_topics',
    'leaderboard',
  ];

  const stats: Partial<Record<FeatureKey, UsageStats>> = {};

  for (const feature of features) {
    const access = getFeatureAccess(tier, feature);
    const limit = access.limits?.limit ?? -1;
    const period = access.limits?.period ?? 'daily';
    const isUnlimitedFeature = limit === -1;

    if (!access.enabled) {
      stats[feature] = {
        used: 0,
        limit: 0,
        remaining: 0,
        period,
        isUnlimited: false,
      };
    } else if (isUnlimitedFeature) {
      stats[feature] = {
        used: 0,
        limit: -1,
        remaining: -1,
        period,
        isUnlimited: true,
      };
    } else {
      const used = await getUsage(userId, feature, period);
      stats[feature] = {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        period,
        isUnlimited: false,
      };
    }
  }

  return stats as Record<FeatureKey, UsageStats>;
}

/**
 * Reset usage for a specific feature (admin function)
 */
export async function resetUsage(
  userId: string,
  feature: FeatureKey,
  period: LimitPeriod
): Promise<void> {
  try {
    const periodDate = getPeriodDate(period);
    
    await db
      .delete(userUsage)
      .where(
        and(
          eq(userUsage.userId, userId),
          eq(userUsage.feature, feature),
          eq(userUsage.period, period),
          eq(userUsage.periodDate, periodDate)
        )
      );
  } catch (error) {
    console.error(`Error resetting usage for ${feature}:`, error);
  }
}
