import { Metadata } from 'next';
import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/server';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { QuickStatsGrid } from '@/components/dashboard/quick-stats-grid';
import { RecommendationsPanel } from '@/components/dashboard/recommendations-panel';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { QuickActionsPanel } from '@/components/dashboard/quick-actions-panel';
import { StreakGoalsWidget } from '@/components/dashboard/streak-goals-widget';
import { AchievementHighlights } from '@/components/dashboard/achievement-highlights';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { ErrorBoundary } from '@/components/dashboard/error-boundary';
import { UpgradeBanner } from '@/components/subscription/upgrade-banner';
import { SubscriptionStatus } from '@/components/subscription/subscription-status';
import {
  WelcomeHeaderSkeleton,
  QuickStatsGridSkeleton,
  RecommendationsPanelSkeleton,
  ActivityFeedSkeleton,
  StreakGoalsWidgetSkeleton,
  QuickActionsPanelSkeleton,
  AchievementHighlightsSkeleton,
  UpcomingEventsSkeleton,
} from '@/components/dashboard/loading-skeletons';
import {
  getUserStats,
  getActivityDates,
  getRecentTests,
  getWeakTopics,
  getActiveGoals,
  getRecentAchievements,
  getNextAchievement,
  getSectionCoverage,
  getUserProfile,
  getAccuracyTrend,
  hasInProgressTest,
} from '@/lib/dashboard/queries';
import { calculateDashboardStats } from '@/lib/dashboard/stats';
import { calculateStreak } from '@/lib/streak-calculator';
import { calculateReadiness } from '@/lib/readiness-calculator';
import { getRecommendations } from '@/lib/dashboard/recommendations';
import { differenceInDays } from 'date-fns';

export const metadata: Metadata = {
  title: 'Dashboard | ExamPrepPlus',
  description: 'Your ExamPrepPlus dashboard',
};

async function getDashboardData(userId: string) {
  try {
    // Fetch all data in parallel for performance
    const [
      userProfile,
      userStats,
      activityDates,
      recentTests,
      weakTopics,
      activeGoals,
      recentAchievements,
      sectionCoverage,
      accuracyTrend,
      hasInProgress,
    ] = await Promise.all([
      getUserProfile(userId),
      getUserStats(userId),
      getActivityDates(userId),
      getRecentTests(userId, 5),
      getWeakTopics(userId, 5),
      getActiveGoals(userId, 2),
      getRecentAchievements(userId, 3),
      getSectionCoverage(userId),
      getAccuracyTrend(userId),
      hasInProgressTest(userId),
    ]);

    // Calculate streak
    const streakData = calculateStreak(activityDates);

    // Prepare data for readiness calculation
    const readinessInput = {
      overallAccuracy: userStats.overallAccuracy,
      sectionsPracticed: sectionCoverage.sectionsPracticed,
      totalSections: sectionCoverage.totalSections,
      testsCompleted: userStats.testsCompleted,
      questionsAnswered: userStats.totalQuestions,
      recentAccuracyTrend: accuracyTrend,
      sectionStats: [],
    };

    const readinessData = calculateReadiness(readinessInput);

    // Calculate dashboard stats
    const stats = calculateDashboardStats(
      userStats,
      streakData,
      readinessData,
      accuracyTrend
    );

    // Prepare user progress for achievement calculation
    const userProgress = {
      testsCompleted: userStats.testsCompleted,
      questionsAnswered: userStats.totalQuestions,
      bestAccuracy: userStats.overallAccuracy,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      sectionsAttempted: sectionCoverage.sectionsPracticed,
      totalSections: sectionCoverage.totalSections,
      perfectScores: userStats.perfectScores,
      averageAccuracy: userStats.overallAccuracy,
    };

    // Get next achievement
    const nextAchievement = await getNextAchievement(userId, userProgress);

    // Calculate total achievement points
    const totalPoints = recentAchievements.reduce((sum, a) => sum + a.points, 0);

    // Prepare goal deadlines for upcoming events (within 7 days)
    const goalDeadlines = activeGoals.filter(g => {
      const daysUntilDeadline = differenceInDays(new Date(g.periodEnd), new Date());
      return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
    });

    // Prepare recent milestones (simplified - using recent achievements)
    const recentMilestones = recentAchievements.map(a => ({
      id: a.id,
      name: a.name,
      achievedAt: a.unlockedAt,
      type: a.category,
    }));

    // Generate recommendations
    const recommendations = getRecommendations({
      testsCompleted: userStats.testsCompleted,
      overallAccuracy: userStats.overallAccuracy,
      readiness: stats.readiness,
      currentStreak: streakData.currentStreak,
      streakData,
      weakTopics,
      activeGoals,
      totalSections: sectionCoverage.totalSections,
      sectionsPracticed: sectionCoverage.sectionsPracticed,
      lastActivityDate: streakData.lastActiveDate,
      weeklyTests: userStats.weeklyTests,
      ...(nextAchievement && {
        nextAchievement: {
          name: nextAchievement.name,
          progress: nextAchievement.progress,
          requirementValue: nextAchievement.requirementValue,
        }
      }),
    });

    return {
      user: {
        name: userProfile?.fullName || 'User',
      },
      stats,
      streakData,
      recommendations,
      recentTests,
      activeGoals,
      hasInProgressTest: hasInProgress,
      weakTopicsCount: weakTopics.length,
      recentAchievements,
      nextAchievement,
      totalPoints,
      perfectScores: userStats.perfectScores,
      goalDeadlines,
      recentMilestones,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const data = await getDashboardData(user.id);

  // Handle error state
  if (!data) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Unable to load dashboard</h2>
          <p className="text-muted-foreground mb-4">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Header */}
      <ErrorBoundary section="Welcome Header">
        <Suspense fallback={<WelcomeHeaderSkeleton />}>
          <WelcomeHeader userName={data.user.name} streakData={data.streakData} />
        </Suspense>
      </ErrorBoundary>

      {/* Upgrade Banner for Free Users */}
      <UpgradeBanner />

      {/* Quick Stats */}
      <ErrorBoundary section="Stats">
        <Suspense fallback={<QuickStatsGridSkeleton />}>
          <QuickStatsGrid stats={data.stats} />
        </Suspense>
      </ErrorBoundary>

      {/* Recommendations */}
      <ErrorBoundary section="Recommendations">
        <Suspense fallback={<RecommendationsPanelSkeleton />}>
          <RecommendationsPanel recommendations={data.recommendations} />
        </Suspense>
      </ErrorBoundary>

      {/* Two Column Layout for Activity Feed and Streak/Goals */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <ErrorBoundary section="Recent Activity">
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <RecentActivityFeed tests={data.recentTests} />
          </Suspense>
        </ErrorBoundary>

        {/* Right Column: Subscription Status + Streak & Goals */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <SubscriptionStatus />

          {/* Streak & Goals Widget */}
          <ErrorBoundary section="Streak & Goals">
            <Suspense fallback={<StreakGoalsWidgetSkeleton />}>
              <StreakGoalsWidget
                streakData={data.streakData}
                activeGoals={data.activeGoals}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Two Column Layout for Achievements and Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Achievement Highlights */}
        <ErrorBoundary section="Achievements">
          <Suspense fallback={<AchievementHighlightsSkeleton />}>
            <AchievementHighlights
              recentAchievements={data.recentAchievements}
              nextAchievement={data.nextAchievement ? {
                id: data.nextAchievement.id,
                name: data.nextAchievement.name,
                description: data.nextAchievement.description || '',
                icon: data.nextAchievement.icon || '🎯',
                category: data.nextAchievement.category,
                points: data.nextAchievement.points,
                progress: data.nextAchievement.progress,
              } : null}
              totalPoints={data.totalPoints}
              perfectScores={data.perfectScores}
              testsCompleted={data.stats.testsCompleted}
            />
          </Suspense>
        </ErrorBoundary>

        {/* Upcoming Events */}
        <ErrorBoundary section="Upcoming Events">
          <Suspense fallback={<UpcomingEventsSkeleton />}>
            <UpcomingEvents
              goalDeadlines={data.goalDeadlines}
              recentMilestones={data.recentMilestones}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Quick Actions Panel */}
      <ErrorBoundary section="Quick Actions">
        <Suspense fallback={<QuickActionsPanelSkeleton />}>
          <QuickActionsPanel
            hasInProgressTest={data.hasInProgressTest}
            weakTopicsCount={data.weakTopicsCount}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
