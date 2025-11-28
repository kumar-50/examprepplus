'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';

interface SubscriptionStatusProps {
  compact?: boolean;
}

export function SubscriptionStatus({ compact = false }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscriptions/status');
      const data = await response.json();

      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Free tier user
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Free Tier</CardTitle>
              <CardDescription>Limited access</CardDescription>
            </div>
            <Badge variant="secondary">FREE</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upgrade to unlock unlimited tests and advanced features.
          </p>
          <Button 
            className="w-full"
            onClick={() => {
              setSelectedPlanId(null);
              setIsModalOpen(true);
            }}
          >
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Premium user
  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
  const daysRemaining = endDate
    ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {subscription.planName}
        </Badge>
        {daysRemaining > 0 && (
          <span className="text-xs text-muted-foreground">
            {daysRemaining} days left
          </span>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{subscription.planName}</CardTitle>
            <CardDescription>
              {subscription.isActive ? 'Active subscription' : 'Expired'}
            </CardDescription>
          </div>
          <Badge variant={subscription.isActive ? 'default' : 'destructive'}>
            {subscription.isActive ? 'ACTIVE' : 'EXPIRED'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.isActive && endDate && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Valid until {endDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {daysRemaining} days remaining
              </span>
            </div>
            {daysRemaining < 7 && (
              <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Your subscription expires soon. Renew to continue unlimited access.
                </p>
              </div>
            )}
          </>
        )}
        
        {!subscription.isActive && (
          <Button 
            className="w-full"
            onClick={() => {
              setSelectedPlanId(null);
              setIsModalOpen(true);
            }}
          >
            Renew Subscription
          </Button>
        )}
      </CardContent>
      
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planId={selectedPlanId}
      />
    </Card>
  );
}
