import { requireAuth } from '@/lib/auth/server';
import { getTestLeaderboard, getTestById } from '@/lib/actions/tests';
import { TestLeaderboardClient } from '@/components/leaderboard/test-leaderboard-client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { notFound } from 'next/navigation';

interface TestLeaderboardPageProps {
  params: Promise<{
    testId: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TestLeaderboardPage({ params }: TestLeaderboardPageProps) {
  const user = await requireAuth();
  const { testId } = await params;
  
  const test = await getTestById(testId);
  if (!test) {
    notFound();
  }

  const leaderboard = await getTestLeaderboard(testId, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/tests/${testId}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold">Test Leaderboard</h1>
              <p className="text-lg text-muted-foreground mt-1">{test.title}</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Rankings based on score and completion time
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <TestLeaderboardClient 
          leaderboard={leaderboard} 
          currentUserId={user.id}
          test={test}
        />
      </Suspense>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}
