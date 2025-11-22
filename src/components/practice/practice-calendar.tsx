import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalendarDay {
  date: Date;
  questionsAnswered: number;
  correctAnswers: number;
  practiceMinutes: number;
  sessionsCompleted: number;
  accuracy: number;
}

interface PracticeCalendarProps {
  calendarData: CalendarDay[];
  currentMonth?: Date;
}

export function PracticeCalendar({ calendarData, currentMonth = new Date() }: PracticeCalendarProps) {
  // Generate all days for the month including padding
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Create a map for quick lookups
  const practiceMap = new Map<string, CalendarDay>();
  calendarData.forEach(day => {
    const key = format(day.date, 'yyyy-MM-dd');
    practiceMap.set(key, day);
  });

  const getDayIntensity = (date: Date): string => {
    const key = format(date, 'yyyy-MM-dd');
    const dayData = practiceMap.get(key);

    if (!dayData || dayData.questionsAnswered === 0) {
      return 'bg-gray-100 hover:bg-gray-200';
    }

    // Color intensity based on questions answered
    if (dayData.questionsAnswered >= 50) {
      return 'bg-green-600 hover:bg-green-700';
    } else if (dayData.questionsAnswered >= 30) {
      return 'bg-green-500 hover:bg-green-600';
    } else if (dayData.questionsAnswered >= 15) {
      return 'bg-green-400 hover:bg-green-500';
    } else {
      return 'bg-green-300 hover:bg-green-400';
    }
  };

  const getDayTooltip = (date: Date): string => {
    const key = format(date, 'yyyy-MM-dd');
    const dayData = practiceMap.get(key);

    if (!dayData || dayData.questionsAnswered === 0) {
      return format(date, 'MMM d, yyyy') + '\nNo practice';
    }

    return `${format(date, 'MMM d, yyyy')}
${dayData.questionsAnswered} questions
${dayData.accuracy}% accuracy
${dayData.sessionsCompleted} ${dayData.sessionsCompleted === 1 ? 'session' : 'sessions'}`;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Practice Calendar - {format(currentMonth, 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mb-4 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded-sm border border-gray-200"></div>
            <div className="w-4 h-4 bg-green-300 rounded-sm"></div>
            <div className="w-4 h-4 bg-green-400 rounded-sm"></div>
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map(day => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const key = format(day, 'yyyy-MM-dd');
              const dayData = practiceMap.get(key);
              
              return (
                <div
                  key={key}
                  title={getDayTooltip(day)}
                  className={cn(
                    'aspect-square rounded-sm transition-all cursor-pointer relative group',
                    getDayIntensity(day),
                    !isCurrentMonth && 'opacity-30'
                  )}
                >
                  {/* Day number */}
                  <span className={cn(
                    'absolute inset-0 flex items-center justify-center text-[10px] font-medium',
                    dayData && dayData.questionsAnswered > 0
                      ? 'text-white'
                      : 'text-gray-600'
                  )}>
                    {format(day, 'd')}
                  </span>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-pre-line shadow-lg">
                      {getDayTooltip(day)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {calendarData.length}
            </p>
            <p className="text-xs text-gray-600">Days Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {calendarData.reduce((sum, day) => sum + day.questionsAnswered, 0)}
            </p>
            <p className="text-xs text-gray-600">Total Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {calendarData.length > 0
                ? Math.round(
                    calendarData.reduce((sum, day) => sum + day.accuracy, 0) / calendarData.length
                  )
                : 0}%
            </p>
            <p className="text-xs text-gray-600">Avg Accuracy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
