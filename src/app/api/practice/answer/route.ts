import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { userAnswers, userTestAttempts, testQuestions, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { updateWeakTopicAfterPractice } from '@/lib/analytics/weak-topic-analyzer';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    const { sessionId, userId, questionId, selectedOption, isCorrect, timeSpent } = body;

    // Verify user matches
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the test question link
    const [testQuestion] = await db
      .select()
      .from(testQuestions)
      .where(eq(testQuestions.questionId, questionId))
      .limit(1);

    if (!testQuestion) {
      return NextResponse.json(
        { error: 'Test question not found' },
        { status: 404 }
      );
    }

    // Save the answer using existing user_answers table
    await db.insert(userAnswers).values({
      attemptId: sessionId,
      questionId: testQuestion.questionId,
      selectedOption,
      isCorrect,
      timeSpent,
      isReviewed: false,
      answeredAt: new Date(),
    });

    // Update attempt progress
    const [currentAttempt] = await db
      .select()
      .from(userTestAttempts)
      .where(eq(userTestAttempts.id, sessionId))
      .limit(1);

    if (currentAttempt) {
      await db
        .update(userTestAttempts)
        .set({
          correctAnswers: isCorrect 
            ? (currentAttempt.correctAnswers || 0) + 1 
            : (currentAttempt.correctAnswers || 0),
          incorrectAnswers: !isCorrect 
            ? (currentAttempt.incorrectAnswers || 0) + 1 
            : (currentAttempt.incorrectAnswers || 0),
          unanswered: Math.max(0, (currentAttempt.unanswered || 0) - 1),
        })
        .where(eq(userTestAttempts.id, sessionId));
    }

    // Update weak topic tracking
    try {
      const [question] = await db
        .select({ topicId: questions.topicId })
        .from(questions)
        .where(eq(questions.id, questionId))
        .limit(1);

      if (question?.topicId) {
        await updateWeakTopicAfterPractice(user.id, question.topicId, isCorrect);
      }
    } catch (weakTopicError) {
      console.error('Error updating weak topic:', weakTopicError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving answer:', error);
    return NextResponse.json(
      { error: 'Failed to save answer' },
      { status: 500 }
    );
  }
}
