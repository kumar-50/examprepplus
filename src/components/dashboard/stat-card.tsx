/**
 * Stat Card Component
 * Individual stat display card
 */

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'yellow' | 'orange' | 'red' | 'default';
}

export function StatCard({
  icon,
  label,
  value,
  subtext,
  trend,
  color = 'default',
}: StatCardProps) {
  const colorClasses = {
    green: 'border-green-200 dark:border-green-900',
    yellow: 'border-yellow-200 dark:border-yellow-900',
    orange: 'border-orange-200 dark:border-orange-900',
    red: 'border-red-200 dark:border-red-900',
    default: '',
  };

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  const trendColor = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className={cn('border-2', colorClasses[color])}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <span className={cn('text-sm font-medium', trendColor[trend])}>
                  {trendIcon[trend]}
                </span>
              )}
            </div>
            {subtext && (
              <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
