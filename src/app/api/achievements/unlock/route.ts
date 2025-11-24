import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { userTestAttempts, achievements, userAchievements } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { checkAchievements, type UserProgress } from '@/lib/achievements';

/**
 * POST /api/achievements/unlock
 * Manually check and unlock achievements for the current user
 * Useful for retroactively unlocking achievements
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    console.log(`🔍 Checking achievements for user: ${user.id}`);

    // Get user's current progress
    const [statsResult] = await db
      .select({
        testsCompleted: sql<number>`COUNT(*)::int`,
        totalQuestions: sql<number>`SUM(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers} + ${userTestAttempts.unanswered})::int`,
        bestAccuracy: sql<number>`MAX((${userTestAttempts.correctAnswers}::float / NULLIF(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers}, 0)) * 100)`,
        perfectScores: sql<number>`COUNT(CASE WHEN ${userTestAttempts.incorrectAnswers} = 0 AND ${userTestAttempts.unanswered} = 0 AND ${userTestAttempts.correctAnswers} > 0 THEN 1 END)::int`,
      })
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.userId, user.id),
          eq(userTestAttempts.status, 'submitted')
        )
      );

    if (!statsResult || statsResult.testsCompleted === 0) {
      return NextResponse.json({
        success: true,
        message: 'No completed tests found',
        unlockedCount: 0,
      });
    }

    console.log(`📊 User stats:`, {
      tests: statsResult.testsCompleted,
      questions: statsResult.totalQuestions,
      bestAccuracy: statsResult.bestAccuracy?.toFixed(1) + '%',
      perfectScores: statsResult.perfectScores,
    });

    const userProgress: UserProgress = {
      testsCompleted: statsResult.testsCompleted,
      questionsAnswered: statsResult.totalQuestions || 0,
      bestAccuracy: statsResult.bestAccuracy || 0,
      currentStreak: 0, // Could calculate from activity dates
      longestStreak: 0,
      sectionsAttempted: 0, // Could calculate from test patterns
      totalSections: 0,
      perfectScores: statsResult.perfectScores,
      averageAccuracy: statsResult.bestAccuracy || 0,
    };

    // Get all achievements
    const allAchievements = await db.select().from(achievements);

    // Map to ensure non-null values and correct types
    const achievementsList: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      requirementType: string;
      requirementValue: number;
      points: number;
    }> = allAchievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description || '',
      icon: a.icon || '🏆',
      category: a.category,
      requirementType: a.requirementType,
      requirementValue: a.requirementValue,
      points: a.points,
    }));

    // Get already unlocked achievement IDs
    const unlockedAchievements = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, user.id));

    const unlockedIds = unlockedAchievements.map(ua => ua.achievementId);

    console.log(`✅ Already unlocked: ${unlockedIds.length} achievements`);

    // Check which achievements should be unlocked
    const newlyUnlocked = checkAchievements(userProgress, achievementsList as any, unlockedIds);

    if (newlyUnlocked.length > 0) {
      // Unlock new achievements
      await db.insert(userAchievements).values(
        newlyUnlocked.map(achievement => ({
          userId: user.id,
          achievementId: achievement.id,
          unlockedAt: new Date(),
        }))
      );

      console.log(`🏆 Unlocked ${newlyUnlocked.length} achievement(s):`, newlyUnlocked.map(a => a.name));

      const totalPoints = newlyUnlocked.reduce((sum, a) => sum + a.points, 0);

      return NextResponse.json({
        success: true,
        message: `Unlocked ${newlyUnlocked.length} achievement${newlyUnlocked.length > 1 ? 's' : ''}!`,
        unlockedCount: newlyUnlocked.length,
        totalPoints,
        achievements: newlyUnlocked.map(a => ({
          name: a.name,
          description: a.description,
          points: a.points,
          icon: a.icon,
        })),
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'No new achievements to unlock',
        unlockedCount: 0,
      });
    }
  } catch (error) {
    console.error('❌ Error unlocking achievements:', error);
    return NextResponse.json(
      { 
        error: 'Failed to unlock achievements',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
