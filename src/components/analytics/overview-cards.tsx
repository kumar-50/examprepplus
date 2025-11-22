/**
 * Overview Statistics Cards Component
 * 
 * Displays 6 key performance metrics at the top of analytics dashboard
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, HelpCircle, CheckCircle, Clock, Flame, TrendingUp } from 'lucide-react';
import type { OverviewStats } from '@/lib/analytics/types';

interface OverviewCardsProps {
  stats: OverviewStats;
  isLoading?: boolean;
}

export function OverviewCards({ stats, isLoading }: OverviewCardsProps) {
  if (isLoading) {
    return <OverviewCardsSkeleton />;
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const cards = [
    {
      title: 'Total Tests',
      value: stats.totalTests.toLocaleString(),
      icon: Target,
      subtitle: `+${stats.testsThisWeek} this week`,
      color: 'text-blue-600',
    },
    {
      title: 'Questions',
      value: stats.totalQuestions.toLocaleString(),
      icon: HelpCircle,
      subtitle: 'Attempted',
      color: 'text-purple-600',
    },
    {
      title: 'Accuracy',
      value: `${stats.overallAccuracy}%`,
      icon: CheckCircle,
      subtitle: 'Overall',
      color: getAccuracyColor(stats.overallAccuracy),
    },
    {
      title: 'Time Spent',
      value: formatTime(stats.totalTimeSpent),
      icon: Clock,
      subtitle: 'Total practice',
      color: 'text-cyan-600',
    },
    {
      title: 'Streak',
      value: `${stats.currentStreak}`,
      icon: Flame,
      subtitle: stats.currentStreak === 1 ? 'day' : 'days',
      color: 'text-orange-600',
    },
    {
      title: 'This Week',
      value: `${stats.testsThisWeek}`,
      icon: TrendingUp,
      subtitle: 'Tests',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className="hover:shadow-md transition-shadow"
          data-analytics-card
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OverviewCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
