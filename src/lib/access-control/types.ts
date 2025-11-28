/**
 * Access Control Types
 */

export type SubscriptionTier = 'free' | 'premium';

export type FeatureKey = 
  | 'mock_tests'
  | 'practice_quizzes'
  | 'scheduled_practice'
  | 'practice_questions'
  | 'topic_access'
  | 'analytics_history'
  | 'analytics_export'
  | 'time_analysis'
  | 'learning_insights'
  | 'activity_heatmap'
  | 'test_history'
  | 'explanations'
  | 'weak_topics'
  | 'leaderboard'
  | 'goals'
  | 'section_coverage'
  | 'improvement_metrics'
  | 'exam_readiness';

export type LimitPeriod = 'daily' | 'weekly' | 'monthly' | 'total';

export interface FeatureLimit {
  limit: number;           // -1 = unlimited
  period: LimitPeriod;
  softLimit?: boolean;     // true = warning only, false = hard block
}

export interface FeatureAccess {
  enabled: boolean;
  limits?: FeatureLimit;
}

export interface TierConfig {
  name: string;
  features: Record<FeatureKey, FeatureAccess>;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  limit?: number;
  used?: number;
  upgradeRequired?: boolean;
  period?: LimitPeriod;
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  period: LimitPeriod;
  isUnlimited: boolean;
}
