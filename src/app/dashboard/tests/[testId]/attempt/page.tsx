import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/server';
import { getTestById, createTestAttempt, getTestQuestions, getTestSyllabus } from '@/lib/actions/tests';
import { TestAttemptEngine } from '@/components/tests/test-attempt-engine';
import { TestInstructions } from '@/components/tests/test-instructions';

interface TestAttemptPageProps {
  params: Promise<{
    testId: string;
  }>;
  searchParams: Promise<{
    attemptId?: string;
    lang?: string;
  }>;
}

export default async function TestAttemptPage({ 
  params, 
  searchParams 
}: TestAttemptPageProps) {
  const user = await requireAuth();
  const { testId } = await params;
  const { attemptId: searchAttemptId, lang } = await searchParams;
  const test = await getTestById(testId);

  if (!test) {
    notFound();
  }

  // Check if test is published
  if (!test.isPublished) {
    redirect('/dashboard/tests');
  }

  // Get or create attempt
  let attemptId = searchAttemptId;
  
  if (!attemptId) {
    // Create new attempt
    const attempt = await createTestAttempt(testId, user.id);
    if (!attempt) {
      throw new Error('Failed to create test attempt');
    }
    attemptId = attempt.id;
  }

  // Load questions and syllabus
  const [questions, syllabus] = await Promise.all([
    getTestQuestions(testId),
    getTestSyllabus(testId),
  ]);

  // If no language selected (first visit), show instructions
  if (!lang) {
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
