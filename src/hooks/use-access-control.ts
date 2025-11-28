'use client';

import { useState, useCallback, useEffect } from 'react';
import { FeatureKey, SubscriptionTier, AccessCheckResult, UsageStats } from '@/lib/access-control/types';

interface UseAccessControlReturn {
  tier: SubscriptionTier | null;
  stats: Record<FeatureKey, UsageStats> | null;
  loading: boolean;
  error: string | null;
  checkFeature: (feature: FeatureKey) => Promise<AccessCheckResult>;
  useFeature: (feature: FeatureKey, count?: number) => Promise<AccessCheckResult>;
  canAccess: (feature: FeatureKey) => boolean;
  getRemaining: (feature: FeatureKey) => number;
  isLimitReached: (feature: FeatureKey) => boolean;
  isPremium: boolean;
  refetch: () => Promise<void>;
}

export function useAccessControl(): UseAccessControlReturn {
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [stats, setStats] = useState<Record<FeatureKey, UsageStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch usage stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/usage');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage');
      }

      setTier(data.tier);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch usage');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user can access a feature
  const checkFeature = useCallback(async (feature: FeatureKey): Promise<AccessCheckResult> => {
    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, action: 'check' }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check feature');
      }

      return data;
    } catch (err) {
      console.error('Error checking feature:', err);
      return { allowed: true }; // Fail open
    }
  }, []);

  // Use a feature (check + increment)
  const useFeatureApi = useCallback(async (
    feature: FeatureKey,
    count: number = 1
  ): Promise<AccessCheckResult> => {
    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, action: 'use', count }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to use feature');
      }

      // Update local stats after using feature
      if (stats && data.used !== undefined) {
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            [feature]: {
              ...prev[feature],
              used: data.used,
              remaining: data.remaining ?? prev[feature].remaining,
            },
          };
        });
      }

      return data;
    } catch (err) {
      console.error('Error using feature:', err);
      return { allowed: true }; // Fail open
    }
  }, [stats]);

  // Check if user can access a feature (sync, from cached stats)
  const canAccess = useCallback((feature: FeatureKey): boolean => {
    if (!stats) return true; // If no stats, assume access
    const featureStats = stats[feature];
    if (!featureStats) return true;
    if (featureStats.isUnlimited) return true;
    if (featureStats.limit === 0) return false; // Feature disabled
    return featureStats.remaining > 0;
  }, [stats]);

  // Get remaining uses for a feature (sync, from cached stats)
  const getRemaining = useCallback((feature: FeatureKey): number => {
    if (!stats) return -1;
    const featureStats = stats[feature];
    if (!featureStats) return -1;
    if (featureStats.isUnlimited) return -1;
    return featureStats.remaining;
  }, [stats]);

  // Check if limit is reached for a feature (sync, from cached stats)
  const isLimitReached = useCallback((feature: FeatureKey): boolean => {
    if (!stats) return false;
    const featureStats = stats[feature];
    if (!featureStats) return false;
    if (featureStats.isUnlimited) return false;
    if (featureStats.limit === 0) return true; // Feature disabled
    return featureStats.remaining === 0;
  }, [stats]);

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    tier,
    stats,
    loading,
    error,
    checkFeature,
    useFeature: useFeatureApi,
    canAccess,
    getRemaining,
    isLimitReached,
    isPremium: tier === 'premium',
    refetch: fetchStats,
  };
}
