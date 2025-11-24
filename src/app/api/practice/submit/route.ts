import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { userTestAttempts, userAnswers, achievements, userAchievements } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { updateWeakTopicsAfterTest } from '@/lib/analytics/weak-topic-analyzer';
import { checkAchievements, type UserProgress } from '@/lib/achievements';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { sessionId, answers } = body;

    console.log('📝 Submit quiz request:', { sessionId, answersCount: answers?.length });

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    if (answers.length === 0) {
      return NextResponse.json(
        { error: 'No answers provided' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const [attempt] = await db
      .select()
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.id, sessionId),
          eq(userTestAttempts.userId, user.id)
        )
      )
      .limit(1);

    if (!attempt) {
      return NextResponse.json(
        { error: 'Practice session not found' },
        { status: 404 }
      );
    }

    if (attempt.status === 'submitted') {
      return NextResponse.json(
        { error: 'This practice session has already been submitted' },
        { status: 400 }
      );
    }

    // Insert all answers into the database
    const answerInserts = answers.map((answer: any) => ({
      attemptId: sessionId,
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect: answer.isCorrect,
      timeSpent: answer.timeSpent || 0,
    }));

    await db.insert(userAnswers).values(answerInserts);

    // Calculate statistics
    const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
    const incorrectAnswers = answers.filter((a: any) => !a.isCorrect).length;
    const totalMarks = answers.length;
    const score = correctAnswers;

    // Update the attempt status
    await db
      .update(userTestAttempts)
      .set({
        status: 'submitted',
        correctAnswers,
        incorrectAnswers,
        unanswered: 0,
        totalMarks,
        score,
        submittedAt: new Date(),
      })
      .where(eq(userTestAttempts.id, sessionId));

    // Update weak topics based on this test performance
    await updateWeakTopicsAfterTest(user.id, sessionId);

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
            eq(userTestAttempts.userId, user.id),
            eq(userTestAttempts.status, 'submitted')
          )
        );

      // Get streak info (simplified - using test count as proxy)
      const userProgress: UserProgress = {
        testsCompleted: statsResult?.testsCompleted || 0,
        questionsAnswered: statsResult?.totalQuestions || 0,
        bestAccuracy: statsResult?.bestAccuracy || 0,
        currentStreak: 0, // Would need proper calculation
        longestStreak: 0,
        sectionsAttempted: 0,
        totalSections: 0,
        perfectScores: statsResult?.perfectScores || 0,
        averageAccuracy: statsResult?.bestAccuracy || 0,
      };

      // Get all achievements
      const allAchievements = await db.select().from(achievements);

      // Get already unlocked achievement IDs
      const unlockedAchievements = await db
        .select({ achievementId: userAchievements.achievementId })
        .from(userAchievements)
        .where(eq(userAchievements.userId, user.id));

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

      // Check which achievements should be unlocked
      const newlyUnlocked = checkAchievements(userProgress, achievementsList as any, unlockedIds);

      // Unlock new achievements
      if (newlyUnlocked.length > 0) {
        await db.insert(userAchievements).values(
          newlyUnlocked.map(achievement => ({
            userId: user.id,
            achievementId: achievement.id,
            unlockedAt: new Date(),
          }))
        );
        console.log(`🏆 Unlocked ${newlyUnlocked.length} new achievement(s):`, newlyUnlocked.map(a => a.name));
      }
    } catch (achievementError) {
      console.error('⚠️ Error checking achievements (non-critical):', achievementError);
      // Don't fail the request if achievement check fails
    }

    return NextResponse.json({
      success: true,
      sessionId,
      stats: {
        correctAnswers,
        incorrectAnswers,
        totalQuestions: answers.length,
        score,
      },
    });
  } catch (error) {
    console.error('❌ Error submitting practice quiz:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit practice quiz' },
      { status: 500 }
    );
  }
}
