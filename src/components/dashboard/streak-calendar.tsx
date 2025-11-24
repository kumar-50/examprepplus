/**
 * Streak Calendar Component
 * Shows last 7 days activity heatmap
 */

import { startOfDay, subDays, isSameDay, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StreakCalendarProps {
  activityDates?: Date[];
  currentStreak: number;
}

export function StreakCalendar({ activityDates = [], currentStreak }: StreakCalendarProps) {
  const today = startOfDay(new Date());
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const isActive = (date: Date) => {
    if (!activityDates || activityDates.length === 0) return false;
    return activityDates.some(activityDate => 
      isSameDay(startOfDay(new Date(activityDate)), date)
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-semibold">
              {currentStreak === 0 ? 'No streak' : `${currentStreak}-day streak`}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentStreak > 0 ? 'Keep it going!' : 'Start practicing today'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {last7Days.map((date, index) => {
          const active = isActive(date);
          const isToday = isSameDay(date, today);
          const dayLabel = format(date, 'EEE');

          return (
            <div key={index} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  'w-full aspect-square rounded-md border-2 transition-colors',
                  active && 'bg-green-500 border-green-600 dark:bg-green-600 dark:border-green-500',
                  !active && 'bg-muted border-muted',
                  isToday && 'ring-2 ring-primary ring-offset-2'
                )}
                title={`${dayLabel} ${format(date, 'MMM d')} - ${active ? 'Active' : 'Inactive'}`}
              />
              <span className="text-xs text-muted-foreground">{dayLabel.slice(0, 1)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted border border-muted" />
          <span>Inactive</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500 border border-green-600" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}
