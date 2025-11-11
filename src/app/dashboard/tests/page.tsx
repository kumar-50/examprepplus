import { Suspense } from 'react';
import { TestLibrary } from '@/components/tests/test-library';

export default async function TestsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Test Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 h-64 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
