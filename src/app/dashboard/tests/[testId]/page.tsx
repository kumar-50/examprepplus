import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/server';
import { getTestById, getUserAttemptHistory } from '@/lib/actions/tests';
import { TestDetailView } from '@/components/tests/test-detail-view';

interface TestDetailPageProps {
  params: Promise<{
    testId: string;
  }>;
}

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TestDetailPage({ params }: TestDetailPageProps) {
  const user = await requireAuth();
  const { testId } = await params;
  
  const test = await getTestById(testId);

  if (!test) {
    notFound();
  }

  // Fetch attempt history
  const attemptHistory = await getUserAttemptHistory(user.id, testId);

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/dashboard/tests"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
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
