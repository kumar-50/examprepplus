'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { FeatureKey } from '@/lib/access-control/types';
import { FEATURE_NAMES, FEATURE_DESCRIPTIONS } from '@/lib/access-control/config';

interface UpgradePromptProps {
  feature: FeatureKey;
  onUpgrade: () => void;
  variant?: 'card' | 'inline' | 'modal';
  remaining?: number;
  limit?: number;
  period?: string;
}

export function UpgradePrompt({
  feature,
  onUpgrade,
  variant = 'card',
  remaining,
  limit,
  period,
}: UpgradePromptProps) {
  const featureName = FEATURE_NAMES[feature];
  const featureDescription = FEATURE_DESCRIPTIONS[feature];

  const isLimitReached = remaining === 0 && limit !== undefined && limit > 0;
  const isDisabled = limit === 0;

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {isLimitReached
              ? `You've used all ${limit} ${featureName.toLowerCase()} for this ${period}`
              : isDisabled
              ? `${featureName} is a premium feature`
              : `Upgrade to unlock unlimited ${featureName.toLowerCase()}`}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
          onClick={onUpgrade}
        >
          <Crown className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="text-center py-8 px-6">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {isLimitReached ? 'Limit Reached' : 'Premium Feature'}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          {isLimitReached
            ? `You've used all ${limit} ${featureName.toLowerCase()} for this ${period}. Upgrade to get unlimited access.`
            : featureDescription}
        </p>
        <Button onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <Sparkles className="h-4 w-4 mr-2" />
          Upgrade to Premium
        </Button>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-lg">
            {isLimitReached ? 'Limit Reached' : 'Unlock Premium'}
          </CardTitle>
        </div>
        <CardDescription>
          {isLimitReached
            ? `You've used ${limit}/${limit} ${featureName.toLowerCase()} this ${period}`
            : featureDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Unlimited {featureName.toLowerCase()}
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Access to all premium features
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Priority support
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          onClick={onUpgrade}
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade Now
        </Button>
      </CardFooter>
    </Card>
  );
}
