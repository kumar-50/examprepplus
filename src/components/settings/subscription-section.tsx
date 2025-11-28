'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { format, differenceInDays, isPast } from 'date-fns'
import { SubscriptionModal } from '@/components/subscription/subscription-modal'

interface SubscriptionData {
  hasActiveSubscription: boolean
  subscription: {
    id: string
    planName: string
    status: string
    startDate: string
    endDate: string
    price: number
    durationDays: number
  } | null
  daysRemaining: number
  expiresAt: string | null
}

interface SubscriptionSectionProps {
  userId: string
}

export function SubscriptionSection({ userId }: SubscriptionSectionProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/status')
      const data = await response.json()
      
      if (data.success) {
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!subscription?.hasActiveSubscription) {
      return <Badge variant="secondary">Free Plan</Badge>
    }
    
    const status = subscription.subscription?.status
    const daysRemaining = subscription.daysRemaining
    
    if (status === 'active') {
      if (daysRemaining <= 7) {
        return <Badge variant="destructive">Expiring Soon</Badge>
      }
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    }
    
    if (status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>
    }
    
    return <Badge variant="secondary">{status}</Badge>
  }

  const getDaysRemainingColor = (days: number) => {
    if (days <= 7) return 'text-red-500'
    if (days <= 30) return 'text-amber-500'
    return 'text-green-500'
  }

  if (isLoading) {
    return (
      <Card id="subscription">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const hasSubscription = subscription?.hasActiveSubscription
  const sub = subscription?.subscription
  const daysRemaining = subscription?.daysRemaining || 0

  return (
    <>
      <Card id="subscription">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasSubscription && sub ? (
            <>
              {/* Current Plan */}
              <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{sub.planName}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₹{sub.price / 100} / {sub.durationDays} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getDaysRemainingColor(daysRemaining)}`}>
                      {daysRemaining}
                    </p>
                    <p className="text-sm text-muted-foreground">days left</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subscription Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sub.startDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Expires On</p>
                    <p className={`text-sm ${daysRemaining <= 7 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                      {format(new Date(sub.endDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning for expiring soon */}
              {daysRemaining <= 7 && daysRemaining > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Renew now to avoid losing access to premium features
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setIsModalOpen(true)}>
                    Renew
                  </Button>
                </div>
              )}

              {/* Features List */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Your Benefits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Unlimited practice tests',
                    'Detailed performance analytics',
                    'Progress tracking',
                    'All question topics',
                    'Priority support',
                    'Ad-free experience',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
              </div>
            </>
          ) : (
            /* No Active Subscription */
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <XCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upgrade to Premium to unlock unlimited practice tests, detailed analytics, 
                and all premium features.
              </p>
              
              {/* Features Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto mb-6 text-left">
                {[
                  'Unlimited practice tests',
                  'Detailed analytics',
                  'Progress tracking',
                  'All topics unlocked',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button onClick={() => setIsModalOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          fetchSubscription() // Refresh after modal closes
        }}
        planId={null}
      />
    </>
  )
}
