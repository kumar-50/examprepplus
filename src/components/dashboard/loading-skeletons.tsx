import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for stat cards
 */
export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for quick stats grid (4 cards)
 */
export function QuickStatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for recommendations panel
 */
export function RecommendationsPanelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
            <Skeleton className="h-5 w-5 rounded flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-24 mt-2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for activity feed
 */
export function ActivityFeedSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for streak calendar
 */
export function StreakCalendarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 text-center">
              <Skeleton className="h-3 w-4 mx-auto mb-2" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-40 mx-auto mt-4" />
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for streak & goals widget
 */
export function StreakGoalsWidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak section */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="flex justify-between gap-1">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded" />
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <Skeleton className="h-5 w-32 mb-3" />
          {/* Goals */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for quick actions panel
 */
export function QuickActionsPanelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for welcome header
 */
export function WelcomeHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-48" />
    </div>
  );
}

/**
 * Loading skeleton for achievement highlights
 */
export function AchievementHighlightsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for upcoming events
 */
export function UpcomingEventsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
