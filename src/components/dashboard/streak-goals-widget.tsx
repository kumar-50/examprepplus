/**
 * Streak & Goals Widget Component
 * Combined widget showing streak calendar and active goals
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StreakCalendar } from './streak-calendar';
import { GoalProgressItem } from './goal-progress-item';
import { Separator } from '@/components/ui/separator';

interface StreakGoalsWidgetProps {
  streakData: {
    currentStreak: number;
    activityDates?: Date[];
  };
  activeGoals: Array<{
    id: string;
    goalType: string;
    goalCategory: string;
    targetValue: number;
    currentValue: number;
    periodEnd: Date;
    progress: number;
  }>;
}

export function StreakGoalsWidget({ streakData, activeGoals }: StreakGoalsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Streak & Goals</span>
          <Link href="/dashboard/progress">
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak Calendar */}
        <StreakCalendar
          activityDates={streakData.activityDates ?? []}
          currentStreak={streakData.currentStreak}
        />

        {/* Separator */}
        {activeGoals.length > 0 && <Separator />}

        {/* Active Goals */}
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📌</span>
              <p className="font-semibold">Active Goals</p>
            </div>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <GoalProgressItem key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">No active goals yet</p>
            <Link href="/dashboard/progress">
              <Button variant="outline" size="sm">
                Set Your First Goal
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
