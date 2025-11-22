/**
 * Activity Heatmap Component
 * 
 * GitHub-style calendar heatmap showing practice frequency
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityData } from '@/lib/analytics/types';
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { useMemo } from 'react';

interface ActivityHeatmapProps {
  data: ActivityData[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Get last 365 days
    const endDate = new Date();
    const startDate = subDays(endDate, 364);
    
    // Generate all days in range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Create a map of date -> activity
    const activityMap = new Map(
      data.map(item => [item.date, item])
    );
    
    // Group days by week
    const weeks: Array<Array<{ date: Date; activity: ActivityData | null }>> = [];
    let currentWeek: Array<{ date: Date; activity: ActivityData | null }> = [];
    
    allDays.forEach((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const activity = activityMap.get(dateStr) || null;
      
      currentWeek.push({ date: day, activity });
      
      // Start new week on Sunday or at the end
      if (day.getDay() === 6 || index === allDays.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weeks;
  }, [data]);

  const getIntensity = (activity: ActivityData | null): string => {
    if (!activity || activity.testCount === 0) return 'bg-muted';
    if (activity.testCount === 1) return 'bg-green-200 dark:bg-green-900';
    if (activity.testCount === 2) return 'bg-green-400 dark:bg-green-700';
    if (activity.testCount >= 3) return 'bg-green-600 dark:bg-green-500';
    return 'bg-muted';
  };

  const totalDays = data.filter(d => d.testCount > 0).length;
  const totalTests = data.reduce((sum, d) => sum + d.testCount, 0);
  const avgPerActiveDay = totalDays > 0 ? (totalTests / totalDays).toFixed(1) : '0';

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Calendar</CardTitle>
          <CardDescription>Your practice activity over the last year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-muted-foreground">No activity data yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start practicing to see your activity calendar!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Calendar</CardTitle>
        <CardDescription>
          {totalDays} active days in the last year
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex flex-col gap-1">
            {/* Day labels */}
            <div className="flex gap-1 ml-6">
              <div className="text-[10px] text-muted-foreground w-2"></div>
              {['Mon', 'Wed', 'Fri'].map((day, i) => (
                <div key={day} className="text-[10px] text-muted-foreground w-24 text-center">
                  {i === 0 && day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="flex gap-1">
              {/* Day of week labels */}
              <div className="flex flex-col gap-1 text-[10px] text-muted-foreground justify-around py-1">
                <div className="h-3">Mon</div>
                <div className="h-3">Wed</div>
                <div className="h-3">Fri</div>
              </div>
              
              {/* Week columns */}
              <div className="flex gap-1">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      const intensity = getIntensity(day.activity);
                      const tooltipText = day.activity
                        ? `${format(day.date, 'MMM d, yyyy')}\n${day.activity.testCount} tests\n${day.activity.questionsCount} questions\n${day.activity.avgAccuracy}% accuracy`
                        : `${format(day.date, 'MMM d, yyyy')}\nNo activity`;
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`w-3 h-3 rounded-sm ${intensity} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                          title={tooltipText}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted"></div>
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
              <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
            </div>
            <span>More</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {avgPerActiveDay} tests per active day
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-center">
          <div>
            <p className="text-2xl font-bold">{totalDays}</p>
            <p className="text-xs text-muted-foreground">Active Days</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalTests}</p>
            <p className="text-xs text-muted-foreground">Total Tests</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.avgAccuracy, 0) / data.length) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
