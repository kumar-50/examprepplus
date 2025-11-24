import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { userTestAttempts, userAnswers, achievements, userAchievements } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { updatePracticeStreak } from '@/lib/practice-streak';
import { checkAchievements, type UserProgress } from '@/lib/achievements';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    const { sessionId, userId } = body;

    // Verify user matches
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get session answers for streak calculation
    const answers = await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.attemptId, sessionId));

    const questionsAnswered = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;

    // Calculate session duration (rough estimate based on timestamp)
    const [attempt] = await db
      .select()
      .from(userTestAttempts)
      .where(eq(userTestAttempts.id, sessionId))
      .limit(1);

    let durationMinutes = 0;
    if (attempt?.startedAt) {
      const now = new Date();
      const started = new Date(attempt.startedAt);
      durationMinutes = Math.round((now.getTime() - started.getTime()) / 60000);
    }

    // Update streak
    await updatePracticeStreak(userId, questionsAnswered, correctAnswers, durationMinutes);

    // Mark attempt as submitted
    await db
      .update(userTestAttempts)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
      })
      .where(eq(userTestAttempts.id, sessionId));

    // Check and unlock achievements
    try {
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
            eq(userTestAttempts.userId, userId),
            eq(userTestAttempts.status, 'submitted')
          )
        );

      const userProgress: UserProgress = {
        testsCompleted: statsResult?.testsCompleted || 0,
        questionsAnswered: statsResult?.totalQuestions || 0,
        bestAccuracy: statsResult?.bestAccuracy || 0,
        currentStreak: 0,
        longestStreak: 0,
        sectionsAttempted: 0,
        totalSections: 0,
        perfectScores: statsResult?.perfectScores || 0,
        averageAccuracy: statsResult?.bestAccuracy || 0,
      };

      // Get all achievements and unlocked IDs
      const allAchievements = await db.select().from(achievements);
      const unlockedAchievements = await db
        .select({ achievementId: userAchievements.achievementId })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const unlockedIds = unlockedAchievements.map(ua => ua.achievementId);

      // Map achievements to ensure non-null values
      const achievementsList = allAchievements.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description || '',
        icon: a.icon || '🏆',
        category: a.category,
        requirementType: a.requirementType,
        requirementValue: a.requirementValue,
        points: a.points,
      }));

      // Check and unlock new achievements
      const newlyUnlocked = checkAchievements(userProgress, achievementsList as any, unlockedIds);

      if (newlyUnlocked.length > 0) {
        await db.insert(userAchievements).values(
          newlyUnlocked.map(achievement => ({
            userId,
            achievementId: achievement.id,
            unlockedAt: new Date(),
          }))
        );
        console.log(`🏆 Unlocked ${newlyUnlocked.length} achievement(s):`, newlyUnlocked.map(a => a.name));
      }
    } catch (achievementError) {
      console.error('⚠️ Error checking achievements (non-critical):', achievementError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { error: 'Failed to complete session' },
      { status: 500 }
    );
  }
}
