'use client';

import { ReactNode, useState } from 'react';
import { UpgradePrompt } from './upgrade-prompt';
import { FeatureKey } from '@/lib/access-control/types';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';
import { Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumFeatureProps {
  feature: FeatureKey;
  isAllowed: boolean;
  isLoading?: boolean;
  remaining?: number;
  limit?: number;
  period?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showOverlay?: boolean;
  showUpgradePrompt?: boolean;
}

export function PremiumFeature({
  feature,
  isAllowed,
  isLoading = false,
  remaining,
  limit,
  period,
  children,
  fallback,
  showOverlay = true,
  showUpgradePrompt = true,
}: PremiumFeatureProps) {
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  // If fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show locked state with overlay
  if (showOverlay) {
    return (
      <>
        <div className="relative">
          {/* Blurred content */}
          <div className="blur-sm pointer-events-none select-none">
            {children}
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="text-center p-6 max-w-sm">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">
                {limit === 0 ? 'Premium Feature' : 'Limit Reached'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {limit === 0
                  ? 'Upgrade to access this feature'
                  : `You've used all ${limit} for this ${period}`}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        <SubscriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          planId={null}
        />
      </>
    );
  }

  // Show upgrade prompt card
  if (showUpgradePrompt) {
    return (
      <>
        <UpgradePrompt
          feature={feature}
          onUpgrade={() => setShowModal(true)}
          variant="card"
          {...(remaining !== undefined && { remaining })}
          {...(limit !== undefined && { limit })}
          {...(period !== undefined && { period })}
        />

        <SubscriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          planId={null}
        />
      </>
    );
  }

  // Just hide content
  return null;
}
