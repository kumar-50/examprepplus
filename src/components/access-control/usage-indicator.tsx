'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FeatureKey } from '@/lib/access-control/types';
import { FEATURE_NAMES } from '@/lib/access-control/config';
import { Infinity, AlertTriangle } from 'lucide-react';

interface UsageIndicatorProps {
  feature: FeatureKey;
  used: number;
  limit: number;
  period: string;
  isUnlimited?: boolean;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

export function UsageIndicator({
  feature,
  used,
  limit,
  period,
  isUnlimited = false,
  showLabel = true,
  compact = false,
  className,
}: UsageIndicatorProps) {
  const featureName = FEATURE_NAMES[feature];
  
  if (isUnlimited) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showLabel && (
          <span className="text-sm text-muted-foreground">{featureName}:</span>
        )}
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Infinity className="h-3 w-3 mr-1" />
          Unlimited
        </Badge>
      </div>
    );
  }

  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const remaining = Math.max(0, limit - used);
  const isLow = percentage >= 80;
  const isReached = remaining === 0;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className={cn(
          'text-sm font-medium',
          isReached && 'text-destructive',
          isLow && !isReached && 'text-amber-600 dark:text-amber-400',
        )}>
          {used}/{limit}
        </span>
        {isLow && <AlertTriangle className="h-3 w-3 text-amber-500" />}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {showLabel ? featureName : 'Usage'}
        </span>
        <span className={cn(
          'font-medium',
          isReached && 'text-destructive',
          isLow && !isReached && 'text-amber-600 dark:text-amber-400',
        )}>
          {used}/{limit} {period}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          'h-2',
          isReached && '[&>div]:bg-destructive',
          isLow && !isReached && '[&>div]:bg-amber-500',
        )}
      />
      {isLow && !isReached && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Only {remaining} remaining
        </p>
      )}
      {isReached && (
        <p className="text-xs text-destructive">
          Limit reached. Upgrade for unlimited access.
        </p>
      )}
    </div>
  );
}
