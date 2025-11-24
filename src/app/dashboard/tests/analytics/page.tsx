import { requireAuth } from '@/lib/auth/server';
import { getUserTestAnalytics } from '@/lib/actions/tests';
import { TestAnalyticsClient } from '@/components/analytics/test-analytics-client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Test Analytics | ExamPrepPlus',
  description: 'Detailed test performance analytics and history',
};

export default async function TestAnalyticsPage() {
  const user = await requireAuth();
  const analytics = await getUserTestAnalytics(user.id);

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
        <div>
          <h1 className="text-3xl font-bold mb-2">Test Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of your test performance
          </p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <TestAnalyticsClient analytics={analytics} userId={user.id} />
      </Suspense>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      {/* Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      {/* Table Skeleton */}
      <Skeleton className="h-96" />
    </div>
  );
}
