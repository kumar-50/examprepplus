import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import {
  achievements,
  userAchievements,
  userTestAttempts,
  userAnswers,
  tests,
  sections,
  questions,
} from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import {
  checkAchievements,
  getAchievementProgress,
  type UserProgress,
  type Achievement,
} from '@/lib/achievements';
import { calculateStreak } from '@/lib/streak-calculator';

/**
 * GET /api/progress/achievements
 * Get all achievements and user's unlocked achievements
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all achievements
    const allAchievements = await db.select().from(achievements);

    // Get user's unlocked achievements
    const unlocked = await db
      .select({
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(userAchievements)
      .where(eq(userAchievements.userId, user.id));

    const unlockedIds = unlocked.map((u) => u.achievementId);

    // Get user progress data
    const progress = await getUserProgress(user.id);

    // Calculate progress for each achievement
    const achievementsWithProgress = allAchievements.map((achievement) => {
      const isUnlocked = unlockedIds.includes(achievement.id);
      const progressData = getAchievementProgress(achievement as Achievement, progress);
      const unlockedData = unlocked.find((u) => u.achievementId === achievement.id);

      return {
        ...achievement,
        isUnlocked,
        unlockedAt: unlockedData?.unlockedAt || null,
        progress: progressData,
      };
    });

    return NextResponse.json({
      achievements: achievementsWithProgress,
      totalPoints: unlocked.length * 10, // Simplified, should calculate actual points
      unlockedCount: unlocked.length,
      totalCount: allAchievements.length,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress/achievements/check
 * Check and unlock new achievements for the current user
 */
export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all achievements
    const allAchievements = await db.select().from(achievements);

    // Get already unlocked achievements
    const unlocked = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, user.id));

    const unlockedIds = unlocked.map((u) => u.achievementId);

    // Get user progress
    const progress = await getUserProgress(user.id);

    // Check for new achievements
    const newAchievements = checkAchievements(
      progress,
      allAchievements as Achievement[],
      unlockedIds
    );

    // Unlock new achievements
    if (newAchievements.length > 0) {
      await db.insert(userAchievements).values(
        newAchievements.map((achievement) => ({
          userId: user.id,
          achievementId: achievement.id,
        }))
      );
    }

    return NextResponse.json({
      newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get user progress data
 */
async function getUserProgress(userId: string): Promise<UserProgress> {
  // Get test stats
  const testStats = await db
    .select({
      testsCompleted: sql<number>`COUNT(*)`,
        bestAccuracy: sql<number>`MAX((${userTestAttempts.correctAnswers}::float / ${tests.totalQuestions}) * 100)`,
      perfectScores: sql<number>`COUNT(CASE WHEN ${userTestAttempts.correctAnswers} = ${tests.totalQuestions} THEN 1 END)`,
      averageAccuracy: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / ${tests.totalQuestions}) * 100)`,
    })
    .from(userTestAttempts)
    .leftJoin(tests, eq(userTestAttempts.testId, tests.id))
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    );

  // Get questions answered
  const questionStats = await db
    .select({
      questionsAnswered: sql<number>`COUNT(*)`,
    })
    .from(userAnswers)
    .leftJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
    .where(eq(userTestAttempts.userId, userId));

  // Get sections attempted (distinct sections from questions answered)
  const sectionStats = await db
    .select({
      sectionsAttempted: sql<number>`COUNT(DISTINCT ${sections.id})`,
    })
    .from(userAnswers)
    .leftJoin(questions, eq(userAnswers.questionId, questions.id))
    .leftJoin(sections, eq(questions.sectionId, sections.id))
    .leftJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
    .where(eq(userTestAttempts.userId, userId));

  // Get total sections
  const totalSectionsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(sections);

  // Get streak data
  const activityDates = await db
    .select({
      date: sql<Date>`DATE(${userTestAttempts.submittedAt})`,
    })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    )
    .groupBy(sql`DATE(${userTestAttempts.submittedAt})`);

  const dates = activityDates.map((d) => new Date(d.date));
  const streakData = calculateStreak(dates);

  return {
    testsCompleted: testStats[0]?.testsCompleted || 0,
    questionsAnswered: questionStats[0]?.questionsAnswered || 0,
    bestAccuracy: testStats[0]?.bestAccuracy || 0,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    sectionsAttempted: sectionStats[0]?.sectionsAttempted || 0,
    totalSections: totalSectionsResult[0]?.count || 0,
    perfectScores: testStats[0]?.perfectScores || 0,
    averageAccuracy: testStats[0]?.averageAccuracy || 0,
  };
}
