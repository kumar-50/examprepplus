'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check, Tag, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string | null;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  planId,
}: SubscriptionModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(planId);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Global promo codes (auto-applied by admin)
  const [globalPromos, setGlobalPromos] = useState<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    applicablePlanId: string | null;
    applicablePlanIds: string[] | null;
  }[]>([]);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="razorpay"]');
    
    if (existingScript) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      setError('Failed to load payment gateway. Please refresh and try again.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch plan details when modal opens
  useEffect(() => {
    if (isOpen) {
      if (planId) {
        // Fetch specific plan
        fetchPlanDetails();
      } else {
        // Fetch all plans
        fetchAllPlans();
      }
    }
  }, [isOpen, planId]);

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();

      if (data.success) {
        const plan = data.plans.find((p: any) => p.id === planId);
        setPlanDetails(plan);
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
  };

  const fetchAllPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();

      if (data.success) {
        // Filter to show only main plans (not early bird)
        const mainPlans = data.plans.filter(
          (p: any) => !p.name.includes('Early Bird') && !p.name.includes('Early Adopter')
        );
        setAllPlans(mainPlans);
        
        // Store global promos if available
        if (data.globalPromos && data.globalPromos.length > 0) {
          setGlobalPromos(data.globalPromos);
        }
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  // Calculate discount amount based on plan price
  const calculateDiscountAmount = (planPrice: number, discountType: 'percentage' | 'fixed', discountValue: number) => {
    if (discountType === 'percentage') {
      return Math.round((planPrice * discountValue) / 100);
    }
    return discountValue * 100; // Convert to paisa
  };

  // Get the applicable global promo for a specific plan
  const getGlobalPromoForPlan = (planId: string) => {
    return globalPromos.find(promo => {
      // If applicablePlanIds array exists and has items, use that
      if (promo.applicablePlanIds && promo.applicablePlanIds.length > 0) {
        return promo.applicablePlanIds.includes(planId);
      }
      // Fallback to old single plan check, or apply to all if null
      return promo.applicablePlanId === null || promo.applicablePlanId === planId;
    });
  };

  // Get the current selected plan's price
  const getSelectedPlanPrice = () => {
    const activePlanId = selectedPlanId || planId;
    const plan = allPlans.find(p => p.id === activePlanId) || planDetails;
    return plan?.price || 0;
  };
  
  // Auto-apply global promo when plan is selected
  useEffect(() => {
    const activePlanId = selectedPlanId || planId;
    if (activePlanId && globalPromos.length > 0 && !appliedPromo) {
      const globalPromo = getGlobalPromoForPlan(activePlanId);
      if (globalPromo) {
        const planPrice = getSelectedPlanPrice();
        const discountAmount = calculateDiscountAmount(planPrice, globalPromo.discountType as 'percentage' | 'fixed', globalPromo.discountValue);
        setAppliedPromo({
          code: globalPromo.code,
          name: globalPromo.name,
          discountType: globalPromo.discountType as 'percentage' | 'fixed',
          discountValue: globalPromo.discountValue,
          discountAmount,
        });
      }
    }
  }, [selectedPlanId, planId, globalPromos]);

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    const activePlanId = selectedPlanId || planId;
    if (!activePlanId) {
      setPromoError('Please select a plan first');
      return;
    }

    setPromoLoading(true);
    setPromoError(null);

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), planId: activePlanId }),
      });

      const data = await response.json();

      if (data.success && data.promoCode) {
        const planPrice = getSelectedPlanPrice();
        const promo = data.promoCode;
        const discountAmount = calculateDiscountAmount(planPrice, promo.discountType, promo.discountValue);
        
        setAppliedPromo({
          code: promo.code,
          name: promo.name,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          discountAmount,
        });
        setPromoCode('');
      } else {
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch (error) {
      setPromoError('Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  // Remove applied promo
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  // Recalculate discount when plan changes
  useEffect(() => {
    if (appliedPromo && (selectedPlanId || planId)) {
      const planPrice = getSelectedPlanPrice();
      const discountAmount = calculateDiscountAmount(planPrice, appliedPromo.discountType, appliedPromo.discountValue);
      setAppliedPromo(prev => prev ? { ...prev, discountAmount } : null);
    }
  }, [selectedPlanId, planId]);

  const handleSubscribe = async () => {
    const activePlanId = selectedPlanId || planId;
    if (!activePlanId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Check if user is authenticated
      const authCheckResponse = await fetch('/api/auth/session');
      const authData = await authCheckResponse.json();

      if (!authData.authenticated) {
        // Redirect directly to signup with plan ID (no modal needed)
        router.push(`/signup?plan=${activePlanId}`);
        setIsLoading(false);
        return;
      }

      // Step 2: Create Razorpay order
      const orderResponse = await fetch('/api/subscriptions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: activePlanId,
          promoCode: appliedPromo?.code || undefined,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Get plan details from orderData or existing planDetails
      const activePlan = orderData.plan || planDetails;

      // Ensure Razorpay script is loaded
      if (!window.Razorpay) {
        throw new Error('Payment gateway not loaded. Please refresh the page.');
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      console.log('🔑 Razorpay Key:', razorpayKey ? `${razorpayKey.slice(0, 10)}...` : 'MISSING');
      console.log('💰 Order Amount:', orderData.order.amount);
      console.log('📦 Order ID:', orderData.order.id);

      // Step 3: Initialize Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'ExamPrepPlus',
        description: `${activePlan.name} Subscription`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          console.log('✅ Payment successful:', response);
          // Step 4: Verify payment
          await verifyPayment(response, activePlan);
        },
        prefill: {
          email: authData.user?.email || '',
        },
        theme: {
          color: '#fca311', // Your brand color
        },
        modal: {
          ondismiss: function () {
            console.log('❌ Payment cancelled by user');
            setIsLoading(false);
          },
          escape: true,
          backdropclose: false,
        },
      };

      console.log('🚀 Opening Razorpay checkout...');
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  const verifyPayment = async (paymentData: any, plan: any) => {
    try {
      const response = await fetch('/api/subscriptions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          planId: plan.id,
          durationDays: plan.durationDays,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Success! Redirect to dashboard
        router.push('/dashboard?subscription=success');
        router.refresh();
        onClose();
      } else {
        throw new Error(data.error || 'Payment verification failed');
      }
    } catch (error: any) {
      setError(error.message || 'Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show all plans if no specific plan selected
  if (!planId && allPlans.length > 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
            <DialogDescription>
              Select a plan to unlock unlimited tests and features
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {allPlans.map((plan) => {
              const isPopular = plan.durationDays === 180;
              const planPromo = getGlobalPromoForPlan(plan.id);
              const hasGlobalDiscount = !!planPromo;
              const discountAmount = hasGlobalDiscount 
                ? calculateDiscountAmount(plan.price, planPromo.discountType as 'percentage' | 'fixed', planPromo.discountValue)
                : 0;
              const finalPrice = hasGlobalDiscount ? plan.price - discountAmount : plan.price;
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    selectedPlanId === plan.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  {isPopular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  {hasGlobalDiscount && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-green-500 text-white">
                        {planPromo.discountType === 'percentage' 
                          ? `${planPromo.discountValue}% OFF`
                          : `₹${planPromo.discountValue} OFF`
                        }
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-full">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <div className="mt-2 mb-4">
                        {hasGlobalDiscount ? (
                          <>
                            <div className="text-lg text-muted-foreground line-through">₹{Math.round(plan.price / 100)}</div>
                            <div className="text-4xl font-bold text-green-600">₹{Math.round(finalPrice / 100)}</div>
                          </>
                        ) : (
                          <div className="text-4xl font-bold">₹{Math.round(plan.price / 100)}</div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {plan.durationDays === 30 && '/ month'}
                          {plan.durationDays === 180 && '/ 6 months'}
                          {plan.durationDays === 365 && '/ year'}
                        </div>
                        {hasGlobalDiscount && (
                          <div className="text-xs text-green-600 mt-1">
                            Save ₹{Math.round(discountAmount / 100)} with {planPromo.code}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.description || `Valid for ${plan.durationDays} days`}
                      </p>
                      <div className="space-y-2 text-left">
                        {plan.features.slice(0, 4).map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            + {plan.features.length - 4} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Section */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold">Have a promo code?</p>
            
            {!appliedPromo ? (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={promoLoading}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyPromo();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCode.trim() || !selectedPlanId}
                  className="whitespace-nowrap"
                >
                  {promoLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Applying...
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4 mr-2" />
                      Apply
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {appliedPromo.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {appliedPromo.discountType === 'percentage' 
                        ? `${appliedPromo.discountValue}% OFF` 
                        : `₹${appliedPromo.discountValue} OFF`}
                      {' '}- Saves ₹{Math.round(appliedPromo.discountAmount / 100)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromo}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {promoError && (
              <p className="text-sm text-destructive">{promoError}</p>
            )}
          </div>

          {/* Price Summary with Promo */}
          {appliedPromo && selectedPlanId && (
            <div className="space-y-2 bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <span className="line-through text-muted-foreground">
                  ₹{Math.round(getSelectedPlanPrice() / 100)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount ({appliedPromo.code})</span>
                <span>-₹{Math.round(appliedPromo.discountAmount / 100)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Final Price</span>
                <span className="text-primary">
                  ₹{Math.round((getSelectedPlanPrice() - appliedPromo.discountAmount) / 100)}
                </span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || !selectedPlanId}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Razorpay
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  if (!planDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscribe to {planDetails.name}</DialogTitle>
          <DialogDescription>
            Complete your payment to unlock unlimited access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">{/* Plan Summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Plan</span>
              <span>{planDetails.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Duration</span>
              <span>{planDetails.durationDays} days</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="font-bold">Total Amount</span>
              <span className="font-bold text-primary">
                ₹{planDetails.price / 100}
              </span>
            </div>
          </div>

          {/* Features Preview */}
          <div className="space-y-2">
            <p className="font-semibold text-sm">What you'll get:</p>
            <div className="space-y-2">
              {planDetails.features.slice(0, 5).map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
              {planDetails.features.length > 5 && (
                <p className="text-xs text-muted-foreground pl-6">
                  + {planDetails.features.length - 5} more features
                </p>
              )}
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold">Have a promo code?</p>
            
            {!appliedPromo ? (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={promoLoading}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyPromo();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCode.trim()}
                  className="whitespace-nowrap"
                >
                  {promoLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Applying...
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4 mr-2" />
                      Apply
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {appliedPromo.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {appliedPromo.discountType === 'percentage' 
                        ? `${appliedPromo.discountValue}% OFF` 
                        : `₹${appliedPromo.discountValue} OFF`}
                      {' '}- Saves ₹{Math.round(appliedPromo.discountAmount / 100)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromo}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {promoError && (
              <p className="text-sm text-destructive">{promoError}</p>
            )}
          </div>

          {/* Updated Total with Promo */}
          {appliedPromo && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <span className="line-through text-muted-foreground">₹{planDetails.price / 100}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount ({appliedPromo.code})</span>
                <span>-₹{Math.round(appliedPromo.discountAmount / 100)}</span>
              </div>
              <div className="flex items-center justify-between text-lg border-t pt-2">
                <span className="font-bold">Final Amount</span>
                <span className="font-bold text-primary">
                  ₹{Math.round((planDetails.price - appliedPromo.discountAmount) / 100)}
                </span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  Pay ₹{appliedPromo 
                    ? Math.round((planDetails.price - appliedPromo.discountAmount) / 100)
                    : planDetails.price / 100}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Razorpay
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
