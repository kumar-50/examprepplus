'use client';

import { useAccessControl } from '@/hooks/use-access-control';
import { UsageIndicator } from '@/components/access-control/usage-indicator';
import { LimitWarning } from '@/components/access-control/limit-warning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Infinity as InfinityIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Usage Dashboard Card - Shows usage stats for the current user
 * Can be placed on any page to show feature usage
 */
export function UsageDashboard() {
  const { tier, stats, loading, isPremium } = useAccessControl();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Your Usage</CardTitle>
        <Badge 
          variant={isPremium ? 'default' : 'secondary'}
          className={isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-500' : ''}
        >
          {isPremium && <Crown className="h-3 w-3 mr-1" />}
          {tier === 'premium' ? 'Premium' : 'Free'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPremium ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <InfinityIcon className="h-4 w-4" />
            <span>You have unlimited access to all features!</span>
          </div>
        ) : (
          <>
            <UsageIndicator
              feature="mock_tests"
              used={stats.mock_tests.used}
              limit={stats.mock_tests.limit}
              period="monthly"
              isUnlimited={stats.mock_tests.isUnlimited}
            />
            <UsageIndicator
              feature="practice_questions"
              used={stats.practice_questions.used}
              limit={stats.practice_questions.limit}
              period="daily"
              isUnlimited={stats.practice_questions.isUnlimited}
            />
            <UsageIndicator
              feature="explanations"
              used={stats.explanations.used}
              limit={stats.explanations.limit}
              period="daily"
              isUnlimited={stats.explanations.isUnlimited}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Mock Test Limit Check - Use before starting a test
 */
export function MockTestLimitCheck({ children }: { children: React.ReactNode }) {
  const { stats, loading, isPremium, isLimitReached } = useAccessControl();

  if (loading) return <>{children}</>;
  
  if (isPremium) return <>{children}</>;
  
  if (!stats) return <>{children}</>;

  const mockTestStats = stats.mock_tests;

  return (
    <div className="space-y-4">
      {!mockTestStats.isUnlimited && (
        <LimitWarning
          feature="mock_tests"
          remaining={mockTestStats.remaining}
          limit={mockTestStats.limit}
          period="monthly"
          threshold={2}
        />
      )}
      {children}
    </div>
  );
}

/**
 * Check if user can start a mock test (sync check from cached stats)
 */
export function useMockTestAccess() {
  const { stats, loading, isPremium, canAccess, useFeature, isLimitReached, refetch } = useAccessControl();
  
  return {
    loading,
    canStartTest: canAccess('mock_tests'),
    isPremium,
    remaining: stats?.mock_tests.remaining ?? -1,
    limit: stats?.mock_tests.limit ?? -1,
    isLimitReached: isLimitReached('mock_tests'),
    useTestSlot: () => useFeature('mock_tests', 1),
    refetch,
  };
}

/**
 * Practice Question Limit Check
 */
export function PracticeQuestionLimitCheck({ children }: { children: React.ReactNode }) {
  const { stats, loading, isPremium } = useAccessControl();

  if (loading) return <>{children}</>;
  
  if (isPremium) return <>{children}</>;
  
  if (!stats) return <>{children}</>;

  const practiceStats = stats.practice_questions;

  return (
    <div className="space-y-4">
      {!practiceStats.isUnlimited && (
        <LimitWarning
          feature="practice_questions"
          remaining={practiceStats.remaining}
          limit={practiceStats.limit}
          period="daily"
          threshold={10}
        />
      )}
      {children}
    </div>
  );
}
