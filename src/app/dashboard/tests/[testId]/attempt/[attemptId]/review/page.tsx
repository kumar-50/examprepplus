import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth/server';
import { getAttemptReview } from '@/lib/actions/tests';
import { TestReviewView } from '@/components/tests/test-review-view';

interface TestReviewPageProps {
  params: Promise<{
    testId: string;
    attemptId: string;
  }>;
}

export default async function TestReviewPage({ params }: TestReviewPageProps) {
  const user = await requireAuth();
  const { attemptId } = await params;
  const review = await getAttemptReview(attemptId, user.id);

  if (!review) {
    notFound();
  }

  return <TestReviewView review={review} />;
}
