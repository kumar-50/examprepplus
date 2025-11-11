import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/server';
import { getTestById, getUserAttemptHistory } from '@/lib/actions/tests';
import { TestDetailView } from '@/components/tests/test-detail-view';

interface TestDetailPageProps {
  params: {
    testId: string;
  };
}

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TestDetailPage({ params }: TestDetailPageProps) {
  const user = await requireAuth();
  
  const test = await getTestById(params.testId);

  if (!test) {
    notFound();
  }

  // Fetch attempt history
  const attemptHistory = await getUserAttemptHistory(user.id, params.testId);

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/dashboard/tests"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tests</span>
        </Link>
      </div>

      {/* Main Content */}
      <TestDetailView 
        test={test} 
        userId={user.id}
        attemptHistory={attemptHistory}
      />
    </div>
  );
}
