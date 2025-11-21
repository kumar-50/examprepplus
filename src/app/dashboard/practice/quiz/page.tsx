import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tests, userTestAttempts, testQuestions, questions } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

interface QuizPageProps {
  searchParams: Promise<{
    topic?: string;
  }>;
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/login?redirect=/dashboard/practice/quiz');
  }

  const { topic } = await searchParams;

  // If no topic specified, redirect to generate page
  if (!topic) {
    redirect('/dashboard/practice/generate');
  }

  try {
    // Fetch 10 random questions for this topic
    const availableQuestions = await db
      .select({
        id: questions.id,
        sectionId: questions.sectionId,
      })
      .from(questions)
      .where(
        and(
          eq(questions.sectionId, topic),
          eq(questions.isVerified, true),
          eq(questions.isActive, true),
          eq(questions.status, 'approved')
        )
      )
      .limit(10);

    if (availableQuestions.length === 0) {
      // No questions available for this topic
      redirect('/dashboard/practice/generate?error=no-questions');
    }

    // Create a practice test
    const [practiceTest] = await db
      .insert(tests)
      .values({
        title: `Quick Practice - Topic Review`,
        description: 'Topic-specific practice',
        testType: 'practice',
        totalQuestions: availableQuestions.length,
        totalMarks: availableQuestions.length,
        duration: 0,
        negativeMarking: false,
        isPublished: false,
        isFree: true,
        testPattern: { sections: [topic] },
        createdBy: user.id,
      })
      .returning();

    if (!practiceTest) {
      throw new Error('Failed to create practice test');
    }

    // Link questions to test
    const testQuestionValues = availableQuestions.map((q, index) => ({
      testId: practiceTest.id,
      questionId: q.id,
      marks: 1,
      questionOrder: index + 1,
      sectionId: q.sectionId,
    }));

    await db.insert(testQuestions).values(testQuestionValues);

    // Create practice attempt
    const [attempt] = await db
      .insert(userTestAttempts)
      .values({
        userId: user.id,
        testId: practiceTest.id,
        status: 'in_progress',
        totalMarks: availableQuestions.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unanswered: availableQuestions.length,
      })
      .returning();

    if (!attempt) {
      throw new Error('Failed to create practice attempt');
    }

    // Redirect to practice session
    redirect(`/dashboard/practice/session/${attempt.id}`);
  } catch (error) {
    console.error('Error auto-generating topic quiz:', error);
    redirect('/dashboard/practice/generate');
  }
}
