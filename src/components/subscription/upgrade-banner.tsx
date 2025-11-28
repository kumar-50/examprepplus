'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';

interface UpgradeBannerProps {
  message?: string;
  showClose?: boolean;
}

export function UpgradeBanner({
  message = 'Upgrade to unlock unlimited tests and advanced features',
  showClose = true,
}: UpgradeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [usage, setUsage] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/subscriptions/usage');
      const data = await response.json();
      
      if (data.success) {
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  if (!isVisible || usage?.mockTests?.isUnlimited) {
    return null;
  }

  return (
    <Alert className="border-primary/50 bg-primary/5 relative">
      <Sparkles className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
          {usage && !usage.mockTests.isUnlimited && (
            <p className="text-xs text-muted-foreground mt-1">
              {usage.mockTests.remaining} of {usage.mockTests.limit} free tests remaining
              {' • '}
              {usage.practiceQuestions.remaining} of {usage.practiceQuestions.limit} practice questions today
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => {
              setSelectedPlanId(null);
              setIsModalOpen(true);
            }}
          >
            View Plans
          </Button>
          {showClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
      
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planId={selectedPlanId}
      />
    </Alert>
  );
}
