/**
 * Analytics Dashboard Page
 * 
 * Comprehensive performance analytics and insights
 */

import { requireAuth } from '@/lib/auth/server';
import {
  getOverviewStats,
  getAccuracyTrend,
  getSectionPerformance,
  getTestTypeComparison,
  getActivityData,
  getDifficultyBreakdown,
  getTimeAnalysis,
  getLearningInsights,
} from '@/lib/analytics/queries';
import { AnalyticsClient } from '@/components/analytics/analytics-client';
import { subDays } from 'date-fns';
import './print.css';
import './animations.css';
import type {
  OverviewStats,
  AccuracyDataPoint,
  SectionPerformance,
  TestTypeComparison,
  ActivityData,
  DifficultyBreakdown,
  Insight,
} from '@/lib/analytics/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Analytics | ExamPrepPlus',
  description: 'Track your performance and identify areas for improvement',
};

export default async function AnalyticsPage() {
  const user = await requireAuth();

  // Parallel data fetching for better performance with error handling
  let overviewStats: OverviewStats;
  let accuracyTrend: AccuracyDataPoint[];
  let sectionPerformance: SectionPerformance[];
  let testTypeData: TestTypeComparison[];
  let activityData: ActivityData[];
  let difficultyData: DifficultyBreakdown[];
  let timeData: { hourPerformance: any[]; dayOfWeekPerformance: any[]; bestTime: any };
  let insights: Insight[];
  
  try {
    [overviewStats, accuracyTrend, sectionPerformance, testTypeData, activityData, difficultyData, timeData, insights] = await Promise.all([
      getOverviewStats(user.id),
      getAccuracyTrend(user.id, { preset: '30d', startDate: new Date(), endDate: new Date() }),
      getSectionPerformance(user.id),
      getTestTypeComparison(user.id),
      getActivityData(user.id, subDays(new Date(), 365)),
      getDifficultyBreakdown(user.id),
      getTimeAnalysis(user.id),
      getLearningInsights(user.id),
    ]);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    // Return default values on error
    overviewStats = {
      totalTests: 0,
      totalQuestions: 0,
      overallAccuracy: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      testsThisWeek: 0,
    };
    accuracyTrend = [];
    sectionPerformance = [];
    testTypeData = [];
    activityData = [];
    difficultyData = [];
    timeData = { hourPerformance: [], dayOfWeekPerformance: [], bestTime: null };
    insights = [];
  }

  const hasData = overviewStats?.totalTests > 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 overflow-x-hidden">
      {/* Empty State */}
      {!hasData && (
        <>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your performance, identify patterns, and measure your progress
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-8xl mb-6">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Analytics Data Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start taking tests to see your performance analytics, track your progress, and get
              personalized insights.
            </p>
            <a
              href="/dashboard/tests"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse Tests
            </a>
          </div>
        </>
      )}

      {/* Analytics Content */}
      {hasData && (
        <AnalyticsClient
          initialData={{
            overview: overviewStats!,
            accuracyTrend: accuracyTrend!,
            sectionPerformance: sectionPerformance!,
            testTypeComparison: testTypeData!,
            activityData: activityData!,
            difficultyData: difficultyData!,
            timeData: timeData!,
            insights: insights!,
          }}
        />
      )}
    </div>
  );
}
