import { requireAuth } from '@/lib/auth/server';
import { getGlobalLeaderboard } from '@/lib/actions/tests';
import { GlobalLeaderboardClient } from '@/components/leaderboard/global-leaderboard-client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';

export const metadata = {
  title: 'Global Leaderboard | ExamPrepPlus',
  description: 'Top performers across all tests',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LeaderboardPage() {
  const user = await requireAuth();
  const leaderboard = await getGlobalLeaderboard(100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/tests"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Global Leaderboard</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Top performers across all tests. Keep practicing to improve your rank!
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <GlobalLeaderboardClient leaderboard={leaderboard} currentUserId={user.id} />
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
