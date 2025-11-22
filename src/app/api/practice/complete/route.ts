import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { userTestAttempts, userAnswers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { updatePracticeStreak } from '@/lib/practice-streak';

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { error: 'Failed to complete session' },
      { status: 500 }
    );
  }
}
