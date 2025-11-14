import { Suspense } from 'react';
import { TestLibrary } from '@/components/tests/test-library';

export default async function TestsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Test Library
        </h1>
        <p className="text-muted-foreground">
          Choose from our comprehensive collection of practice tests
        </p>
      </div>

      {/* Content */}
      <Suspense fallback={<TestLibrarySkeleton />}>
        <TestLibrary userId="" />
      </Suspense>
    </div>
  );
}

function TestLibrarySkeleton() {
  return (
    <div className="space-y-6">
      {/* Search and Filters Skeleton */}
      <div className="bg-card rounded-lg p-6 space-y-4 border">
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg p-6 h-64 animate-pulse border"
          >
            <div className="h-4 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mb-4" />
            <div className="h-20 bg-muted rounded mb-4" />
            <div className="h-10 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
