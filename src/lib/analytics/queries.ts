/**
 * Analytics Dashboard - Database Queries
 * 
 * Centralized query functions for fetching analytics data
 */

import { db } from '@/db';
import { userTestAttempts, tests, userAnswers, questions, sections } from '@/db/schema';
import { eq, and, gte, lte, sql, desc, isNotNull } from 'drizzle-orm';
import { subDays, format } from 'date-fns';
import { getStreakData } from '@/lib/practice-streak';
import type {
  OverviewStats,
  AccuracyDataPoint,
  SectionPerformance,
  TestTypeComparison,
  ActivityData,
  DifficultyBreakdown,
  DateRange,
  HourPerformance,
  DayOfWeekPerformance,
  BestPerformanceTime,
  Insight,
} from './types';

// ============================================================================
// Overview Statistics
// ============================================================================

export async function getOverviewStats(userId: string): Promise<OverviewStats> {
  try {
    // Get overall test statistics
    const result = await db
      .select({
        totalTests: sql<number>`COUNT(*)::int`,
        totalQuestions: sql<number>`COALESCE(SUM(${tests.totalQuestions}), 0)::int`,
        avgAccuracy: sql<number>`
          COALESCE(
            AVG(
              (${userTestAttempts.correctAnswers}::float / 
               NULLIF(${tests.totalQuestions}, 0)) * 100
            ), 0
          )
        `,
        totalSeconds: sql<number>`
          COALESCE(
            SUM(
              EXTRACT(EPOCH FROM (${userTestAttempts.submittedAt} - ${userTestAttempts.startedAt}))
            ), 0
          )::int
        `,
      })
      .from(userTestAttempts)
      .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted'),
          isNotNull(userTestAttempts.submittedAt)
        )
      );

    // Get current streak from existing function
    const streakData = await getStreakData(userId);
    const currentStreak = streakData.currentStreak;

    // Get tests this week
    const weekAgo = subDays(new Date(), 7);
    const weeklyTests = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted'),
          gte(userTestAttempts.submittedAt, weekAgo)
        )
      );

    const stats = result[0] || {
      totalTests: 0,
      totalQuestions: 0,
      avgAccuracy: 0,
      totalSeconds: 0,
    };

    return {
      totalTests: stats.totalTests,
      totalQuestions: stats.totalQuestions,
      overallAccuracy: Math.round(stats.avgAccuracy),
      totalTimeSpent: Math.round(stats.totalSeconds / 60), // Convert to minutes
      currentStreak,
      testsThisWeek: weeklyTests[0]?.count ?? 0,
    };
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    // Return default empty stats instead of throwing
    return {
      totalTests: 0,
      totalQuestions: 0,
      overallAccuracy: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      testsThisWeek: 0,
    };
  }
}

// ============================================================================
// Accuracy Trend
// ============================================================================

export async function getAccuracyTrend(
  userId: string,
  dateRange: DateRange
): Promise<AccuracyDataPoint[]> {
  try {
    let startDate: Date;

    // Calculate date range based on preset
    switch (dateRange.preset) {
      case '7d':
        startDate = subDays(new Date(), 7);
        break;
      case '30d':
        startDate = subDays(new Date(), 30);
        break;
      case '90d':
        startDate = subDays(new Date(), 90);
        break;
      case 'all':
        startDate = new Date('2020-01-01'); // Far past date
        break;
      case 'custom':
        startDate = dateRange.startDate;
        break;
      default:
        startDate = subDays(new Date(), 30);
    }

    const result = await db
      .select({
        date: sql<string>`DATE(${userTestAttempts.submittedAt})`,
        testName: tests.title,
        testType: tests.testType,
        testId: tests.id,
        totalQuestions: tests.totalQuestions,
        accuracy: sql<number>`
          (${userTestAttempts.correctAnswers}::float / 
           NULLIF(${tests.totalQuestions}, 0)) * 100
        `,
      })
      .from(userTestAttempts)
      .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted'),
          gte(userTestAttempts.submittedAt, startDate),
          isNotNull(userTestAttempts.submittedAt)
        )
      )
      .orderBy(userTestAttempts.submittedAt);

    return result.map((row) => ({
      date: row.date,
      accuracy: Math.round(row.accuracy || 0),
      testName: row.testName,
      testType: row.testType,
      totalQuestions: row.totalQuestions,
      testId: row.testId,
    }));
  } catch (error) {
    console.error('Error fetching accuracy trend:', error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
}

// ============================================================================
// Section Performance
// ============================================================================

export async function getSectionPerformance(userId: string): Promise<SectionPerformance[]> {
  try {
    const result = await db
      .select({
        sectionId: sections.id,
        sectionName: sections.name,
        questionsAttempted: sql<number>`COUNT(${userAnswers.id})::int`,
        correctAnswers: sql<number>`
          SUM(CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END)::int
        `,
        incorrectAnswers: sql<number>`
          SUM(CASE WHEN ${userAnswers.isCorrect} = false THEN 1 ELSE 0 END)::int
        `,
        accuracy: sql<number>`
          (SUM(CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END)::float / 
           NULLIF(COUNT(${userAnswers.id}), 0)) * 100
        `,
        avgTimeSeconds: sql<number>`
          AVG(
            EXTRACT(EPOCH FROM (${userAnswers.answeredAt} - ${userAnswers.createdAt}))
          )
        `,
      })
      .from(userAnswers)
      .innerJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
      .innerJoin(questions, eq(userAnswers.questionId, questions.id))
      .innerJoin(sections, eq(questions.sectionId, sections.id))
      .where(eq(userTestAttempts.userId, userId))
      .groupBy(sections.id, sections.name)
      .orderBy(desc(sql`(SUM(CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END)::float / NULLIF(COUNT(${userAnswers.id}), 0)) * 100`));

    return result.map((row) => ({
      sectionId: row.sectionId,
      sectionName: row.sectionName,
      accuracy: Math.round(row.accuracy || 0),
      questionsAttempted: row.questionsAttempted,
      correctAnswers: row.correctAnswers,
      incorrectAnswers: row.incorrectAnswers,
      avgTimePerQuestion: Math.round(row.avgTimeSeconds || 0),
    }));
  } catch (error) {
    console.error('Error fetching section performance:', error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
}

// ============================================================================
// Test Type Comparison
// ============================================================================

export async function getTestTypeComparison(userId: string): Promise<TestTypeComparison[]> {
  try {
    const result = await db
      .select({
        testType: tests.testType,
        testCount: sql<number>`COUNT(*)::int`,
        avgAccuracy: sql<number>`
          AVG(
            (${userTestAttempts.correctAnswers}::float / 
             NULLIF(${tests.totalQuestions}, 0)) * 100
          )
        `,
        totalQuestions: sql<number>`SUM(${tests.totalQuestions})::int`,
        passedCount: sql<number>`
          SUM(
            CASE WHEN (${userTestAttempts.correctAnswers}::float / 
                       NULLIF(${tests.totalQuestions}, 0)) * 100 >= 60 
            THEN 1 ELSE 0 END
          )::int
        `,
      })
      .from(userTestAttempts)
      .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted')
        )
      )
      .groupBy(tests.testType)
      .orderBy(tests.testType);

    return result.map((row) => ({
      testType: row.testType,
      avgAccuracy: Math.round(row.avgAccuracy || 0),
      testCount: row.testCount,
      totalQuestions: row.totalQuestions,
      passRate: row.testCount > 0 ? Math.round((row.passedCount / row.testCount) * 100) : 0,
    }));
  } catch (error) {
    console.error('Error fetching test type comparison:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// ============================================================================
// Activity Data (for heatmap)
// ============================================================================

export async function getActivityData(
  userId: string,
  startDate: Date = subDays(new Date(), 365)
): Promise<ActivityData[]> {
  try {
    const result = await db
      .select({
        date: sql<string>`DATE(${userTestAttempts.submittedAt})`,
        testCount: sql<number>`COUNT(*)::int`,
        questionsCount: sql<number>`SUM(${tests.totalQuestions})::int`,
        avgAccuracy: sql<number>`
          AVG(
            (${userTestAttempts.correctAnswers}::float / 
             NULLIF(${tests.totalQuestions}, 0)) * 100
          )
        `,
      })
      .from(userTestAttempts)
      .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted'),
          gte(userTestAttempts.submittedAt, startDate),
          isNotNull(userTestAttempts.submittedAt)
        )
      )
      .groupBy(sql`DATE(${userTestAttempts.submittedAt})`)
      .orderBy(sql`DATE(${userTestAttempts.submittedAt})`);

    return result.map((row) => ({
      date: row.date,
      testCount: row.testCount,
      questionsCount: row.questionsCount,
      avgAccuracy: Math.round(row.avgAccuracy || 0),
    }));
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return [];
  }
}

// ============================================================================
// Difficulty Breakdown
// ============================================================================

export async function getDifficultyBreakdown(userId: string): Promise<DifficultyBreakdown[]> {
  try {
    const result = await db
      .select({
        difficulty: questions.difficultyLevel,
        attempted: sql<number>`COUNT(${userAnswers.id})::int`,
        correct: sql<number>`
          SUM(CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END)::int
        `,
        accuracy: sql<number>`
          (SUM(CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END)::float / 
           NULLIF(COUNT(${userAnswers.id}), 0)) * 100
        `,
      })
      .from(userAnswers)
      .innerJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
      .innerJoin(questions, eq(userAnswers.questionId, questions.id))
      .where(eq(userTestAttempts.userId, userId))
      .groupBy(questions.difficultyLevel)
      .orderBy(
        sql`CASE ${questions.difficultyLevel} 
          WHEN 'easy' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'hard' THEN 3 
          ELSE 4 END`
      );

    return result.map((row) => ({
      difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
      attempted: row.attempted,
      correct: row.correct,
      accuracy: Math.round(row.accuracy || 0),
    }));
  } catch (error) {
    console.error('Error fetching difficulty breakdown:', error);
    return [];
  }
}

// ============================================================================
// Helper: Get Date Range
// ============================================================================

export function getDateRangeFromPreset(preset: DateRange['preset']): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (preset) {
    case '7d':
      start = subDays(end, 7);
      break;
    case '30d':
      start = subDays(end, 30);
      break;
    case '90d':
      start = subDays(end, 90);
      break;
    case 'all':
      start = new Date('2020-01-01');
      break;
    default:
      start = subDays(end, 30);
  }

  return { start, end };
}

// ============================================================================
// Time Analysis
// ============================================================================

export async function getTimeAnalysis(userId: string): Promise<{
  hourPerformance: HourPerformance[];
  dayOfWeekPerformance: DayOfWeekPerformance[];
  bestTime: BestPerformanceTime | null;
}> {
  try {
    // Get performance by hour and day of week
    const hourlyData = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${userTestAttempts.submittedAt})::int`,
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${userTestAttempts.submittedAt})::int`,
        avgAccuracy: sql<number>`
          AVG(
            (${userTestAttempts.correctAnswers}::float / 
             NULLIF(${tests.totalQuestions}, 0)) * 100
          )
        `,
        testCount: sql<number>`COUNT(*)::int`,
      })
      .from(userTestAttempts)
      .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted'),
          isNotNull(userTestAttempts.submittedAt)
        )
      )
      .groupBy(sql`EXTRACT(HOUR FROM ${userTestAttempts.submittedAt})`, sql`EXTRACT(DOW FROM ${userTestAttempts.submittedAt})`)
      .having(sql`COUNT(*) >= 2`); // Only include hours with at least 2 tests

    const hourPerformance: HourPerformance[] = hourlyData.map(row => ({
      hour: row.hour,
      dayOfWeek: row.dayOfWeek,
      avgAccuracy: Math.round(row.avgAccuracy || 0),
      testCount: row.testCount,
    }));

    // Get performance by day of week
    const dayData = await db
      .select({
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${userTestAttempts.submittedAt})::int`,
        avgAccuracy: sql<number>`
          AVG(
            (${userTestAttempts.correctAnswers}::float / 
             NULLIF(${tests.totalQuestions}, 0)) * 100
          )
        `,
        testCount: sql<number>`COUNT(*)::int`,
      })
      .from(userTestAttempts)
      .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted'),
          isNotNull(userTestAttempts.submittedAt)
        )
      )
      .groupBy(sql`EXTRACT(DOW FROM ${userTestAttempts.submittedAt})`)
      .orderBy(sql`EXTRACT(DOW FROM ${userTestAttempts.submittedAt})`);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekPerformance: DayOfWeekPerformance[] = dayData.map(row => ({
      dayOfWeek: row.dayOfWeek,
      dayName: dayNames[row.dayOfWeek] || 'Unknown',
      avgAccuracy: Math.round(row.avgAccuracy || 0),
      testCount: row.testCount,
    }));

    // Find best performance time
    let bestTime: BestPerformanceTime | null = null;
    if (hourPerformance.length > 0) {
      const best = hourPerformance.reduce((prev, curr) => 
        curr.avgAccuracy > prev.avgAccuracy ? curr : prev
      );
      
      const hour12 = best.hour % 12 || 12;
      const ampm = best.hour >= 12 ? 'PM' : 'AM';
      const dayName = dayNames[best.dayOfWeek];
      
      bestTime = {
        hour: best.hour,
        dayOfWeek: best.dayOfWeek,
        accuracy: best.avgAccuracy,
        description: `${dayName}s at ${hour12}:00 ${ampm}`,
      };
    }

    return {
      hourPerformance,
      dayOfWeekPerformance,
      bestTime,
    };
  } catch (error) {
    console.error('Error fetching time analysis:', error);
    return {
      hourPerformance: [],
      dayOfWeekPerformance: [],
      bestTime: null,
    };
  }
}

// ============================================================================
// Learning Insights
// ============================================================================

export async function getLearningInsights(userId: string): Promise<Insight[]> {
  try {
    const insights: Insight[] = [];

    // Get overview stats for insights
    const stats = await getOverviewStats(userId);
    const sectionPerf = await getSectionPerformance(userId);
    const difficulty = await getDifficultyBreakdown(userId);

    // Insight 1: Overall Performance
    if (stats.overallAccuracy >= 80) {
      insights.push({
        id: 'high-accuracy',
        type: 'success',
        icon: '🎯',
        title: 'Excellent Performance!',
        message: `You're maintaining a ${stats.overallAccuracy}% accuracy rate. Keep up the great work!`,
        priority: 5,
        dismissible: true,
        createdAt: new Date(),
      });
    } else if (stats.overallAccuracy < 60) {
      insights.push({
        id: 'low-accuracy',
        type: 'warning',
        icon: '📚',
        title: 'Room for Improvement',
        message: `Your current accuracy is ${stats.overallAccuracy}%. Focus on understanding concepts rather than memorization.`,
        priority: 4,
        action: {
          label: 'Practice Now',
          url: '/dashboard/practice',
        },
        dismissible: false,
        createdAt: new Date(),
      });
    }

    // Insight 2: Streak
    if (stats.currentStreak >= 7) {
      insights.push({
        id: 'streak-milestone',
        type: 'success',
        icon: '🔥',
        title: 'On Fire!',
        message: `Amazing! You've maintained a ${stats.currentStreak}-day study streak. Consistency is key to success.`,
        priority: 4,
        dismissible: true,
        createdAt: new Date(),
      });
    } else if (stats.currentStreak === 0 && stats.totalTests > 0) {
      insights.push({
        id: 'broken-streak',
        type: 'info',
        icon: '⏰',
        title: 'Start a New Streak',
        message: 'Practice daily to build momentum and improve retention.',
        priority: 3,
        action: {
          label: 'Take a Test',
          url: '/dashboard/tests',
        },
        dismissible: true,
        createdAt: new Date(),
      });
    }

    // Insight 3: Weak Section
    if (sectionPerf.length > 0) {
      const weakest = sectionPerf[sectionPerf.length - 1];
      if (weakest && weakest.accuracy < 60) {
        insights.push({
          id: 'weak-section',
          type: 'recommendation',
          icon: '💡',
          title: 'Focus Area Identified',
          message: `${weakest.sectionName} needs attention (${weakest.accuracy}% accuracy). Practice more questions from this section.`,
          priority: 5,
          action: {
            label: 'Practice Section',
            url: '/dashboard/practice',
          },
          dismissible: false,
          createdAt: new Date(),
        });
      }
    }

    // Insight 4: Difficulty Pattern
    const hardQuestions = difficulty.find(d => d.difficulty === 'hard');
    if (hardQuestions && hardQuestions.attempted > 10) {
      if (hardQuestions.accuracy >= 70) {
        insights.push({
          id: 'hard-mastery',
          type: 'success',
          icon: '💪',
          title: 'Mastering Difficult Questions',
          message: `Impressive! You're scoring ${hardQuestions.accuracy}% on hard questions. You're ready for challenging tests.`,
          priority: 3,
          dismissible: true,
          createdAt: new Date(),
        });
      } else if (hardQuestions.accuracy < 50) {
        insights.push({
          id: 'hard-struggle',
          type: 'recommendation',
          icon: '📖',
          title: 'Build Foundation',
          message: 'Focus on medium difficulty questions first to strengthen your fundamentals.',
          priority: 4,
          dismissible: true,
          createdAt: new Date(),
        });
      }
    }

    // Insight 5: Activity Level
    if (stats.testsThisWeek === 0 && stats.totalTests > 0) {
      insights.push({
        id: 'inactive-week',
        type: 'info',
        icon: '📅',
        title: 'Stay Active',
        message: 'You haven\'t taken any tests this week. Regular practice leads to better results.',
        priority: 3,
        action: {
          label: 'Browse Tests',
          url: '/dashboard/tests',
        },
        dismissible: true,
        createdAt: new Date(),
      });
    } else if (stats.testsThisWeek >= 5) {
      insights.push({
        id: 'active-week',
        type: 'success',
        icon: '⚡',
        title: 'Highly Active!',
        message: `You've completed ${stats.testsThisWeek} tests this week. Your dedication is commendable!`,
        priority: 2,
        dismissible: true,
        createdAt: new Date(),
      });
    }

    // Sort by priority (descending)
    return insights.sort((a, b) => b.priority - a.priority);
  } catch (error) {
    console.error('Error generating learning insights:', error);
    return [];
  }
}
