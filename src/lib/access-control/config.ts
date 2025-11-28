/**
 * Access Control Configuration
 * Defines feature limits for each subscription tier
 */

import { FeatureKey, TierConfig, SubscriptionTier } from './types';

/**
 * Tier configuration with feature access and limits
 */
export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: 'Free',
    features: {
      mock_tests: {
        enabled: true,
        limits: { limit: 3, period: 'monthly' }
      },
      practice_quizzes: {
        enabled: true,
        limits: { limit: 5, period: 'daily' }
      },
      scheduled_practice: {
        enabled: true,
        limits: { limit: 3, period: 'weekly' }
      },
      practice_questions: {
        enabled: true,
        limits: { limit: 50, period: 'daily' }
      },
      topic_access: {
        enabled: true,
        limits: { limit: 5, period: 'total' }
      },
      analytics_history: {
        enabled: true,
        limits: { limit: 7, period: 'total' }  // 7 days of history
      },
      analytics_export: {
        enabled: false  // Premium only
      },
      time_analysis: {
        enabled: false  // Premium only
      },
      learning_insights: {
        enabled: true,
        limits: { limit: 2, period: 'total' }  // 2 insights for free
      },
      activity_heatmap: {
        enabled: true,
        limits: { limit: 30, period: 'total' }  // 30 days for free
      },
      test_history: {
        enabled: true,
        limits: { limit: 5, period: 'total' }  // Last 5 tests only
      },
      explanations: {
        enabled: true,
        limits: { limit: 10, period: 'daily' }
      },
      weak_topics: {
        enabled: false  // Premium only
      },
      leaderboard: {
        enabled: true,
        limits: { limit: 10, period: 'total' }  // Top 10 only
      },
      goals: {
        enabled: true,
        limits: { limit: 1, period: 'total' }  // 1 active goal for free
      },
      section_coverage: {
        enabled: true,
        limits: { limit: 3, period: 'total' }  // Top 3 sections for free
      },
      improvement_metrics: {
        enabled: false  // Premium only
      },
      exam_readiness: {
        enabled: true,
        limits: { limit: 1, period: 'total' }  // Basic score only (no breakdown)
      }
    }
  },
  premium: {
    name: 'Premium',
    features: {
      mock_tests: {
        enabled: true,
        limits: { limit: -1, period: 'monthly' }  // Unlimited
      },
      practice_quizzes: {
        enabled: true,
        limits: { limit: -1, period: 'daily' }  // Unlimited
      },
      scheduled_practice: {
        enabled: true,
        limits: { limit: -1, period: 'weekly' }  // Unlimited
      },
      practice_questions: {
        enabled: true,
        limits: { limit: -1, period: 'daily' }  // Unlimited
      },
      topic_access: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // All topics
      },
      analytics_history: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // Full history
      },
      analytics_export: {
        enabled: true  // Full access
      },
      time_analysis: {
        enabled: true  // Full access
      },
      learning_insights: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // All insights
      },
      activity_heatmap: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // Full 365 days
      },
      test_history: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // All history
      },
      explanations: {
        enabled: true,
        limits: { limit: -1, period: 'daily' }  // Unlimited
      },
      weak_topics: {
        enabled: true  // Full access
      },
      leaderboard: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // Full leaderboard
      },
      goals: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // Unlimited goals
      },
      section_coverage: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // All sections
      },
      improvement_metrics: {
        enabled: true  // Full access
      },
      exam_readiness: {
        enabled: true,
        limits: { limit: -1, period: 'total' }  // Full breakdown
      }
    }
  }
};

/**
 * Get tier configuration by subscription tier
 */
export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return TIER_CONFIGS[tier];
}

/**
 * Get feature access configuration for a specific feature and tier
 */
export function getFeatureAccess(tier: SubscriptionTier, feature: FeatureKey) {
  return TIER_CONFIGS[tier].features[feature];
}

/**
 * Check if a feature is enabled for a tier
 */
export function isFeatureEnabled(tier: SubscriptionTier, feature: FeatureKey): boolean {
  const access = getFeatureAccess(tier, feature);
  return access.enabled;
}

/**
 * Get the limit for a feature and tier (-1 = unlimited)
 */
export function getFeatureLimit(tier: SubscriptionTier, feature: FeatureKey): number {
  const access = getFeatureAccess(tier, feature);
  return access.limits?.limit ?? -1;
}

/**
 * Check if a feature has unlimited access
 */
export function isUnlimited(tier: SubscriptionTier, feature: FeatureKey): boolean {
  const limit = getFeatureLimit(tier, feature);
  return limit === -1;
}

/**
 * Human-readable feature names
 */
export const FEATURE_NAMES: Record<FeatureKey, string> = {
  mock_tests: 'Mock Tests',
  practice_quizzes: 'Practice Quizzes',
  scheduled_practice: 'Scheduled Practice',
  practice_questions: 'Practice Questions',
  topic_access: 'Topic Access',
  analytics_history: 'Analytics History',
  analytics_export: 'Analytics Export',
  time_analysis: 'Time Analysis',
  learning_insights: 'Learning Insights',
  activity_heatmap: 'Activity Calendar',
  test_history: 'Test History',
  explanations: 'Answer Explanations',
  weak_topics: 'Weak Topics Analysis',
  leaderboard: 'Leaderboard',
  goals: 'Goals',
  section_coverage: 'Section Coverage',
  improvement_metrics: 'Improvement Metrics',
  exam_readiness: 'Exam Readiness'
};

/**
 * Feature descriptions for upgrade prompts
 */
export const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  mock_tests: 'Take unlimited mock tests to prepare better',
  practice_quizzes: 'Generate unlimited practice quizzes daily',
  scheduled_practice: 'Schedule unlimited practice sessions',
  practice_questions: 'Practice as many questions as you want daily',
  topic_access: 'Access all topics and sections',
  analytics_history: 'View your full performance history',
  analytics_export: 'Export analytics reports as PDF or CSV',
  time_analysis: 'Discover your peak performance times',
  learning_insights: 'Get personalized learning recommendations',
  activity_heatmap: 'View your full year activity calendar',
  test_history: 'Review all your past test attempts',
  explanations: 'Get detailed explanations for all answers',
  weak_topics: 'Identify and improve your weak areas',
  leaderboard: 'See the full leaderboard rankings',
  goals: 'Create unlimited goals to track your progress',
  section_coverage: 'View coverage for all exam sections',
  improvement_metrics: 'Track your month-over-month improvement',
  exam_readiness: 'Get detailed exam readiness breakdown'
};
