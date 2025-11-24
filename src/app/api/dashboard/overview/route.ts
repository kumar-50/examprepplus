import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import {
  getUserStats,
  getActivityDates,
  getRecentTests,
  getWeakTopics,
  getActiveGoals,
  getRecentAchievements,
  getNextAchievement,
  getSectionCoverage,
  hasInProgressTest,
  getUserProfile,
  getAccuracyTrend,
} from '@/lib/dashboard/queries';
import { calculateDashboardStats } from '@/lib/dashboard/stats';
import { calculateStreak } from '@/lib/streak-calculator';
import { calculateReadiness } from '@/lib/readiness-calculator';
import { getRecommendations } from '@/lib/dashboard/recommendations';

/**
 * GET /api/dashboard/overview
 * Returns all dashboard data in one API call
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const userId = user.id;

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
      hasInProgress,
      accuracyTrend,
    ] = await Promise.all([
      getUserProfile(userId),
      getUserStats(userId),
      getActivityDates(userId),
      getRecentTests(userId, 5),
      getWeakTopics(userId, 5),
      getActiveGoals(userId, 2),
      getRecentAchievements(userId, 3),
      getSectionCoverage(userId),
      hasInProgressTest(userId),
      getAccuracyTrend(userId),
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
      sectionStats: [], // Can be expanded later with detailed section stats
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
        },
      }),
    });

    // Calculate total achievement points
    const totalPoints = recentAchievements.reduce((sum, a) => sum + a.points, 0);

    // Return complete dashboard data
    return NextResponse.json({
      user: {
        id: userProfile?.id || userId,
        name: userProfile?.fullName || 'User',
        email: userProfile?.email || '',
        avatar: userProfile?.avatarUrl,
        lastLoginAt: userProfile?.lastLoginAt,
      },
      stats: {
        testsCompleted: stats.testsCompleted,
        overallAccuracy: stats.overallAccuracy,
        weeklyTests: stats.weeklyTests,
        currentStreak: stats.currentStreak,
        readiness: stats.readiness,
        readinessStatus: stats.readinessStatus,
        trend: accuracyTrend > 0 ? 'improving' : accuracyTrend < 0 ? 'declining' : 'stable',
        accuracyTrend,
      },
      streakData: {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        totalActiveDays: streakData.totalActiveDays,
        lastActiveDate: streakData.lastActiveDate,
        streakProtection: streakData.streakProtection,
        activityDates: activityDates.slice(0, 7), // Last 7 days for calendar
      },
      recommendations,
      recentTests,
      activeGoals,
      achievements: {
        recent: recentAchievements,
        next: nextAchievement ? {
          id: nextAchievement.id,
          name: nextAchievement.name,
          description: nextAchievement.description || '',
          icon: nextAchievement.icon || '🏆',
          progress: nextAchievement.progress,
          requirementValue: nextAchievement.requirementValue,
        } : null,
        totalPoints,
      },
      weakTopics,
      hasInProgressTest: hasInProgress,
      sectionCoverage,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
