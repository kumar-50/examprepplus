import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/server';
import { getTestById, createTestAttempt, getTestQuestions, getTestSyllabus } from '@/lib/actions/tests';
import { TestAttemptEngine } from '@/components/tests/test-attempt-engine';
import { TestInstructions } from '@/components/tests/test-instructions';

interface TestAttemptPageProps {
  params: {
    testId: string;
  };
  searchParams: {
    attemptId?: string;
    lang?: string;
  };
}

export default async function TestAttemptPage({ 
  params, 
  searchParams 
}: TestAttemptPageProps) {
  const user = await requireAuth();
  const test = await getTestById(params.testId);

  if (!test) {
    notFound();
  }

  // Check if test is published
  if (!test.isPublished) {
    redirect('/dashboard/tests');
  }

  // Get or create attempt
  let attemptId = searchParams.attemptId;
  
  if (!attemptId) {
    // Create new attempt
    const attempt = await createTestAttempt(params.testId, user.id);
    if (!attempt) {
      throw new Error('Failed to create test attempt');
    }
    attemptId = attempt.id;
  }

  // Load questions and syllabus
  const [questions, syllabus] = await Promise.all([
    getTestQuestions(params.testId),
    getTestSyllabus(params.testId),
  ]);

  // If no language selected (first visit), show instructions
  if (!searchParams.lang) {
    return (
      <TestInstructions
        test={test}
        attemptId={attemptId}
        questionCount={questions.length}
        sectionCount={syllabus.length}
      />
    );
  }

  // Otherwise, show the test engine
  return (
    <TestAttemptEngine
      test={test}
      attemptId={attemptId}
      questions={questions}
      userId={user.id}
    />
  );
}
