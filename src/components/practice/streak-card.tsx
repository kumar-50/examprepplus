import React from 'react';
import { Flame, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalPracticeDays: number;
  streakStatus: 'active' | 'at-risk' | 'broken';
  isActiveToday: boolean;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  totalPracticeDays,
  streakStatus,
  isActiveToday,
}: StreakCardProps) {
  const getStreakColor = () => {
    if (streakStatus === 'active') return 'text-orange-500';
    if (streakStatus === 'at-risk') return 'text-yellow-500';
    return 'text-gray-400';
  };

  const getStreakBadge = () => {
    if (streakStatus === 'active') {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    if (streakStatus === 'at-risk') {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Practice Today!</Badge>;
    }
    return <Badge variant="outline" className="text-gray-500">Start Streak</Badge>;
  };

  const getStreakMessage = () => {
    if (isActiveToday) {
      return "Great job! You've practiced today.";
    }
    if (streakStatus === 'at-risk') {
      return "Don't break your streak! Practice today to keep it going.";
    }
    if (streakStatus === 'broken' && currentStreak === 0 && totalPracticeDays > 0) {
      return 'Start a new streak today!';
    }
    return 'Begin your practice journey!';
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Flame className={`h-5 w-5 ${getStreakColor()}`} />
            Practice Streak
          </CardTitle>
          {getStreakBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="text-center py-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flame className={`h-8 w-8 ${getStreakColor()}`} />
            <span className="text-5xl font-bold text-gray-800">
              {currentStreak}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {currentStreak === 1 ? 'Day' : 'Days'} Streak
          </p>
          <p className="text-xs text-gray-500 mt-2">{getStreakMessage()}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Longest Streak */}
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">
                {longestStreak}
              </span>
            </div>
            <p className="text-xs text-gray-600">Best Streak</p>
          </div>

          {/* Total Days */}
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-gray-800">
                {totalPracticeDays}
              </span>
            </div>
            <p className="text-xs text-gray-600">Total Days</p>
          </div>
        </div>

        {/* Motivational Messages */}
        {currentStreak >= 7 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-purple-700">
              🎉 Amazing! {currentStreak} days in a row!
            </p>
          </div>
        )}

        {currentStreak >= 30 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-orange-700">
              🔥 You're on fire! One month streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
