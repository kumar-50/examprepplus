import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import {
  userTestAttempts,
  userAnswers,
  tests,
  sections,
  questions,
} from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { calculateReadiness, type UserStats } from '@/lib/readiness-calculator';

/**
 * GET /api/progress/readiness
 * Calculate exam readiness for the current user
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

    // Get overall stats
    const overallStats = await db
      .select({
        avgAccuracy: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / NULLIF(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers} + ${userTestAttempts.unanswered}, 0)) * 100)`,
        testsCompleted: sql<number>`COUNT(*)`,
        questionsAnswered: sql<number>`SUM(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers})`,
      })
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.userId, user.id),
          eq(userTestAttempts.status, 'submitted')
        )
      );

    // Get sections practiced (distinct sections from questions answered)
    const sectionsPracticedResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${sections.id})`,
      })
      .from(userAnswers)
      .leftJoin(questions, eq(userAnswers.questionId, questions.id))
      .leftJoin(sections, eq(questions.sectionId, sections.id))
      .leftJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
      .where(eq(userTestAttempts.userId, user.id));

    // Get total sections count
    const totalSectionsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sections);

    // Get section-wise stats
    const sectionStats = await db
      .select({
        sectionId: sections.id,
        sectionName: sections.name,
        accuracy: sql<number>`AVG(CASE WHEN ${userAnswers.isCorrect} THEN 100 ELSE 0 END)`,
        questionsAttempted: sql<number>`COUNT(*)`,
        daysPracticed: sql<number>`COUNT(DISTINCT DATE(${userAnswers.createdAt}))`,
      })
      .from(userAnswers)
      .leftJoin(questions, eq(userAnswers.questionId, questions.id))
      .leftJoin(sections, eq(questions.sectionId, sections.id))
      .leftJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
      .where(eq(userTestAttempts.userId, user.id))
      .groupBy(sections.id, sections.name);

    // Calculate recent accuracy trend (last 10 tests vs previous 10)
    const recentTests = await db
      .select({
        accuracy: sql<number>`(${userTestAttempts.correctAnswers}::float / NULLIF(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers} + ${userTestAttempts.unanswered}, 0)) * 100`,
        submittedAt: userTestAttempts.submittedAt,
      })
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.userId, user.id),
          eq(userTestAttempts.status, 'submitted')
        )
      )
      .orderBy(desc(userTestAttempts.submittedAt))
      .limit(20);

    let recentTrend = 0;
    if (recentTests.length >= 10) {
      const recent10 = recentTests.slice(0, 10);
      const previous10 = recentTests.slice(10, 20);
      
      const recentAvg = recent10.reduce((sum, t) => sum + (t.accuracy || 0), 0) / recent10.length;
      const previousAvg = previous10.reduce((sum, t) => sum + (t.accuracy || 0), 0) / previous10.length;
      
      recentTrend = recentAvg - previousAvg;
    }

    // Build stats object
    const stats: UserStats = {
      overallAccuracy: overallStats[0]?.avgAccuracy || 0,
      sectionsPracticed: sectionsPracticedResult[0]?.count || 0,
      totalSections: totalSectionsResult[0]?.count || 0,
      testsCompleted: overallStats[0]?.testsCompleted || 0,
      questionsAnswered: overallStats[0]?.questionsAnswered || 0,
      recentAccuracyTrend: recentTrend,
      sectionStats: sectionStats.map((s) => ({
        sectionId: s.sectionId || '',
        sectionName: s.sectionName || '',
        accuracy: s.accuracy || 0,
        questionsAttempted: s.questionsAttempted || 0,
        daysPracticed: s.daysPracticed || 0,
      })),
    };

    // Calculate readiness
    const readiness = calculateReadiness(stats);

    return NextResponse.json(readiness);
  } catch (error) {
    console.error('Error calculating readiness:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
