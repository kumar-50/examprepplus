import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { userTestAttempts, userAnswers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateWeakTopicsAfterTest } from '@/lib/analytics/weak-topic-analyzer';

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
