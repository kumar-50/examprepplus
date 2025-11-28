import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Page content skeleton */}
      <div className="flex-1 space-y-6">
        {/* Page title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-10 w-16 mt-4" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
