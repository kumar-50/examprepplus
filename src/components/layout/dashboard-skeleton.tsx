import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b px-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="ml-3 h-5 w-32" />
        </div>

        {/* Navigation */}
        <div className="flex-1 space-y-4 py-4">
          <div className="px-6">
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-1 px-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* User info skeleton */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <Skeleton className="h-10 w-10 lg:hidden" />
          <Skeleton className="hidden lg:block h-10 w-10" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>

        {/* Page content skeleton */}
        <main className="flex-1 overflow-auto p-6">
          {/* Page title */}
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-3" />
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
        </main>
      </div>
    </div>
  )
}
