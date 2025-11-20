import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { userTestAttempts, tests, testQuestions, questions } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { PracticeAttemptEngine } from '@/components/practice/practice-attempt-engine';

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function PracticeSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/login?redirect=/dashboard/practice');
  }

  // Fetch the practice attempt
  const [attempt] = await db
    .select({
      id: userTestAttempts.id,
      userId: userTestAttempts.userId,
      testId: userTestAttempts.testId,
      status: userTestAttempts.status,
    })
    .from(userTestAttempts)
    .where(eq(userTestAttempts.id, sessionId))
    .limit(1);

  if (!attempt || attempt.userId !== user.id) {
    redirect('/dashboard/practice');
  }

  // If already completed, redirect to review
  if (attempt.status === 'submitted') {
    redirect(`/dashboard/practice/review/${sessionId}`);
  }

  // Fetch the test details
  const [test] = await db
    .select()
    .from(tests)
    .where(eq(tests.id, attempt.testId))
    .limit(1);

  if (!test || test.testType !== 'practice') {
    redirect('/dashboard/practice');
  }

  // Fetch questions for this practice session (via test_questions join)
  const sessionQuestions = await db
    .select({
      id: questions.id,
      questionText: questions.questionText,
      questionTextHindi: sql<string | null>`NULL`.as('questionTextHindi'),
      option1: questions.option1,
      option1Hindi: sql<string | null>`NULL`.as('option1Hindi'),
      option2: questions.option2,
      option2Hindi: sql<string | null>`NULL`.as('option2Hindi'),
      option3: questions.option3,
      option3Hindi: sql<string | null>`NULL`.as('option3Hindi'),
      option4: questions.option4,
      option4Hindi: sql<string | null>`NULL`.as('option4Hindi'),
      correctAnswer: questions.correctOption,
      explanation: questions.explanation,
      explanationHindi: sql<string | null>`NULL`.as('explanationHindi'),
      difficulty: questions.difficultyLevel,
      sectionId: questions.sectionId,
    })
    .from(testQuestions)
    .innerJoin(questions, eq(testQuestions.questionId, questions.id))
    .where(eq(testQuestions.testId, attempt.testId))
    .orderBy(testQuestions.questionOrder);

  if (sessionQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Questions Available</h1>
          <p className="text-muted-foreground">
            There are no questions available for this practice session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6">
      <PracticeAttemptEngine
        session={{
          id: attempt.id,
          title: test.title,
          totalQuestions: test.totalQuestions,
          difficulty: test.description,
        }}
        questions={sessionQuestions as any}
        userId={user.id}
      />
    </div>
  );
}
