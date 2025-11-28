'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown } from 'lucide-react';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';
import { cn } from '@/lib/utils';
import { FEATURE_NAMES } from '@/lib/access-control/config';
import { FeatureKey } from '@/lib/access-control/types';

interface LimitWarningProps {
  feature: FeatureKey;
  remaining: number;
  limit: number;
  period: string;
  threshold?: number; // Show warning when remaining <= threshold
  className?: string;
}

export function LimitWarning({
  feature,
  remaining,
  limit,
  period,
  threshold = 3,
  className,
}: LimitWarningProps) {
  const [showModal, setShowModal] = useState(false);

  // Don't show warning if not low or limit is reached
  if (remaining > threshold || remaining === 0) {
    return null;
  }

  const featureName = FEATURE_NAMES[feature];

  return (
    <>
      <div className={cn(
        'flex items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg',
        className
      )}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Only <span className="font-semibold">{remaining}</span> {featureName.toLowerCase()} left this {period}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-300"
          onClick={() => setShowModal(true)}
        >
          <Crown className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      </div>

      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        planId={null}
      />
    </>
  );
}
