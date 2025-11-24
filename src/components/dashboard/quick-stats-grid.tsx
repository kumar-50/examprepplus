/**
 * Quick Stats Grid Component
 * Displays 4 key metrics in a grid
 */

import { StatCard } from './stat-card';
import {
  getReadinessStatusText,
  getReadinessColor,
  getTrendText,
  getAccuracyColor,
} from '@/lib/dashboard/stats';

interface QuickStatsGridProps {
  stats: {
    testsCompleted: number;
    weeklyTests: number;
    overallAccuracy: number;
    accuracyTrend: number;
    currentStreak: number;
    readiness: number;
  };
}

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  const readinessColor = getReadinessColor(stats.readiness);
  const accuracyColor = getAccuracyColor(stats.overallAccuracy);
  const trendDirection = stats.accuracyTrend > 0 ? 'up' : stats.accuracyTrend < 0 ? 'down' : 'neutral';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon="📝"
        label="Tests Completed"
        value={stats.testsCompleted}
        subtext={stats.weeklyTests > 0 ? `+${stats.weeklyTests} this week` : 'No tests this week'}
      />
      
      <StatCard
        icon="✓"
        label="Overall Accuracy"
        value={`${stats.overallAccuracy.toFixed(1)}%`}
        subtext={getTrendText(stats.accuracyTrend)}
        trend={trendDirection}
        color={accuracyColor}
      />
      
      <StatCard
        icon="🔥"
        label="Current Streak"
        value={stats.currentStreak === 0 ? '0 days' : `${stats.currentStreak} day${stats.currentStreak > 1 ? 's' : ''}`}
        subtext={stats.currentStreak > 0 ? 'Active' : 'Start today!'}
        color={stats.currentStreak >= 3 ? 'green' : stats.currentStreak > 0 ? 'yellow' : 'default'}
      />
      
      <StatCard
        icon="🎯"
        label="Exam Readiness"
        value={`${stats.readiness}%`}
        subtext={getReadinessStatusText(stats.readiness)}
        color={readinessColor}
      />
    </div>
  );
}
