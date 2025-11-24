'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import type { StreakData } from '@/lib/streak-calculator';

interface StreakCalendarProps {
  streakData: StreakData & {
    calendar: Array<{ date: Date; hasActivity: boolean }>;
    milestone: {
      current: number;
      next: number;
      remaining: number;
      icon: string;
    };
  };
}

export function StreakCalendar({ streakData }: StreakCalendarProps) {
  const { currentStreak, longestStreak, totalActiveDays, calendar, milestone, streakProtection } =
    streakData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Streak</CardTitle>
        <CardDescription>Keep your learning momentum going</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Streak */}
          <div className="text-center">
            <div className="text-5xl mb-2">{milestone.icon}</div>
            <div className="text-3xl font-bold">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Current Streak</p>
            {streakProtection && (
              <p className="text-xs text-yellow-600 mt-2">
                🛡️ Streak protection active - practice today to continue!
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{longestStreak}</div>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalActiveDays}</div>
              <p className="text-xs text-muted-foreground">Total Active Days</p>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Last 30 Days</h4>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-xs text-center text-muted-foreground">
                  {day}
                </div>
              ))}
              {calendar.map((day, index) => {
                const isToday = isSameDay(day.date, new Date());
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded-md flex items-center justify-center text-xs
                      ${day.hasActivity ? 'bg-green-500 text-white' : 'bg-gray-100'}
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                    `}
                    title={format(day.date, 'MMM d, yyyy')}
                  >
                    {day.hasActivity ? '✓' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Milestone */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Next Milestone: <span className="font-semibold">{milestone.next} days</span>
            </p>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${(currentStreak / milestone.next) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {milestone.remaining} days to go!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
