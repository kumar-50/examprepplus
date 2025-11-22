/**
 * Time Analysis Component
 * 
 * Heatmap showing best performing times and day patterns
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { HourPerformance, DayOfWeekPerformance, BestPerformanceTime } from '@/lib/analytics/types';
import { Trophy, Clock } from 'lucide-react';

interface TimeAnalysisProps {
  hourPerformance: HourPerformance[];
  dayOfWeekPerformance: DayOfWeekPerformance[];
  bestTime: BestPerformanceTime | null;
}

export function TimeAnalysisChart({ hourPerformance, dayOfWeekPerformance, bestTime }: TimeAnalysisProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getIntensity = (hour: number, day: number): { color: string; accuracy: number | null; count: number } => {
    const data = hourPerformance.find(h => h.hour === hour && h.dayOfWeek === day);
    if (!data) return { color: 'bg-muted', accuracy: null, count: 0 };
    
    const accuracy = data.avgAccuracy;
    if (accuracy >= 80) return { color: 'bg-green-500', accuracy, count: data.testCount };
    if (accuracy >= 70) return { color: 'bg-green-400', accuracy, count: data.testCount };
    if (accuracy >= 60) return { color: 'bg-yellow-400', accuracy, count: data.testCount };
    if (accuracy >= 50) return { color: 'bg-orange-400', accuracy, count: data.testCount };
    return { color: 'bg-red-400', accuracy, count: data.testCount };
  };

  const hasData = hourPerformance.length > 0 || dayOfWeekPerformance.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Analysis</CardTitle>
          <CardDescription>Find your peak performance times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">⏰</div>
            <p className="text-muted-foreground">No time pattern data yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Take more tests at different times to discover your peak performance hours!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Analysis</CardTitle>
        <CardDescription>
          Your performance patterns by time and day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best Performance Time */}
        {bestTime && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
            <Trophy className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Peak Performance Time</p>
              <p className="text-sm text-muted-foreground mt-1">
                You perform best on <span className="font-medium text-foreground">{bestTime.description}</span> with{' '}
                <span className="font-medium text-foreground">{bestTime.accuracy}% accuracy</span>
              </p>
            </div>
          </div>
        )}

        {/* Day of Week Performance */}
        {dayOfWeekPerformance.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Performance by Day of Week
            </h4>
            <div className="space-y-2">
              {dayOfWeekPerformance.map((day) => (
                <div key={day.dayOfWeek} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-20">{day.dayName}</span>
                    <span className="text-muted-foreground">
                      {day.avgAccuracy}% ({day.testCount} tests)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        day.avgAccuracy >= 80 ? 'bg-green-500' :
                        day.avgAccuracy >= 70 ? 'bg-green-400' :
                        day.avgAccuracy >= 60 ? 'bg-yellow-400' :
                        day.avgAccuracy >= 50 ? 'bg-orange-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${day.avgAccuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hour x Day Heatmap */}
        {hourPerformance.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Performance Heatmap (Hour × Day)</h4>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Hour labels */}
                <div className="flex mb-1">
                  <div className="w-12"></div>
                  <div className="flex gap-1">
                    {[0, 6, 12, 18].map(h => (
                      <div key={h} className="text-[10px] text-muted-foreground w-16 text-center">
                        {h}:00
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <div key={day} className="flex gap-1 mb-1">
                    <div className="w-12 text-xs text-muted-foreground flex items-center">
                      {dayNames[day]}
                    </div>
                    <div className="flex gap-0.5">
                      {hours.map(hour => {
                        const { color, accuracy, count } = getIntensity(hour, day);
                        const tooltipText = accuracy !== null
                          ? `${dayNames[day]} ${hour}:00\n${accuracy}% accuracy\n${count} tests`
                          : `${dayNames[day]} ${hour}:00\nNo data`;
                        
                        return (
                          <div
                            key={hour}
                            className={`w-2 h-6 ${color} hover:ring-2 hover:ring-primary transition-all cursor-pointer rounded-sm`}
                            title={tooltipText}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Low</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-red-400"></div>
                <div className="w-3 h-3 rounded-sm bg-orange-400"></div>
                <div className="w-3 h-3 rounded-sm bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
              </div>
              <span>High Accuracy</span>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">
              {dayOfWeekPerformance.length > 0
                ? dayOfWeekPerformance.reduce((max, d) => d.avgAccuracy > max.avgAccuracy ? d : max).dayName
                : '-'}
            </p>
            <p className="text-xs text-muted-foreground">Best Day</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {hourPerformance.length > 0
                ? Math.round(hourPerformance.reduce((sum, h) => sum + h.avgAccuracy, 0) / hourPerformance.length)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {hourPerformance.reduce((sum, h) => sum + h.testCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Tests</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
