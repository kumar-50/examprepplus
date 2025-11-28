'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Tag } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  displayOrder: number;
}

interface GlobalPromo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  applicablePlanId: string | null;
  applicablePlanIds: string[] | null;
}

export function HomePricingSection() {
  const router = useRouter();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [globalPromos, setGlobalPromos] = useState<GlobalPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();

      if (data.success) {
        // Filter to show only main plans (not early bird)
        const mainPlans = data.plans.filter(
          (p: PricingPlan) => !p.name.includes('Early Bird') && !p.name.includes('Early Adopter')
        );
        setPlans(mainPlans);
        setGlobalPromos(data.globalPromos || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (planId: string) => {
    router.push(`/signup?plan=${planId}`);
  };

  const formatPrice = (price: number) => {
    return Math.round(price / 100);
  };

  const getDurationText = (days: number) => {
    if (days === 30) return '1 month';
    if (days === 180) return '6 months';
    if (days === 365) return '12 months';
    return `${days} days`;
  };

  // Get applicable promo for a plan
  const getPromoForPlan = (planId: string): GlobalPromo | null => {
    for (const promo of globalPromos) {
      // Check if promo applies to this specific plan or all plans
      if (
        !promo.applicablePlanId && !promo.applicablePlanIds || // applies to all
        promo.applicablePlanId === planId || // legacy single plan
        promo.applicablePlanIds?.includes(planId) // multiple plans
      ) {
        return promo;
      }
    }
    return null;
  };

  // Calculate discounted price
  const getDiscountedPrice = (originalPrice: number, promo: GlobalPromo): number => {
    if (promo.discountType === 'percentage') {
      return originalPrice - (originalPrice * promo.discountValue / 100);
    } else {
      // Fixed discount (in paise)
      return Math.max(0, originalPrice - promo.discountValue);
    }
  };

  // Get discount display text
  const getDiscountText = (promo: GlobalPromo): string => {
    if (promo.discountType === 'percentage') {
      return `${promo.discountValue}% OFF`;
    } else {
      return `₹${Math.round(promo.discountValue / 100)} OFF`;
    }
  };

  if (isLoading) {
    return (
      <section id="pricing" className="px-4 py-6 sm:py-6 lg:py-8 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4">Choose Your Plan</h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Simple, transparent pricing for every aspirant.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse text-muted-foreground">Loading plans...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="pricing" className="px-4 py-6 sm:py-6 lg:py-8 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4">Choose Your Plan</h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Simple, transparent pricing for every aspirant.
            </p>
          </div>
          
          {/* Show global promo banner if any active */}
          {globalPromos[0] && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                  <Tag className="w-5 h-5" />
                  <span>Special Offer Active!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Use code <span className="font-mono font-bold text-foreground">{globalPromos[0].code}</span> for {getDiscountText(globalPromos[0])}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-8">
            {plans.map((plan, index) => {
              const isPopular = plan.durationDays === 180; // Half-yearly is most popular
              const promo = getPromoForPlan(plan.id);
              const originalPrice = plan.price;
              const discountedPrice = promo ? getDiscountedPrice(originalPrice, promo) : originalPrice;
              const hasDiscount = promo && discountedPrice < originalPrice;
              const rupees = formatPrice(discountedPrice);
              const originalRupees = formatPrice(originalPrice);
              const duration = getDurationText(plan.durationDays);

              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${
                    isPopular ? 'border-primary shadow-lg md:scale-105 hover:shadow-xl' : 'md:scale-100 hover:shadow-lg'
                  } transition-shadow`}
                >
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute -top-3 -right-3 z-20">
                      <Badge className="bg-green-500 text-white px-2 py-1 text-xs font-bold">
                        {getDiscountText(promo!)}
                      </Badge>
                    </div>
                  )}
                  
                  {isPopular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 text-xs sm:text-sm whitespace-nowrap">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className={isPopular ? 'pt-6 sm:pt-8' : ''}>
                    <CardTitle className={`text-xl sm:text-2xl ${isPopular ? 'text-primary' : ''}`}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-1 sm:space-y-2">
                      {hasDiscount ? (
                        <div>
                          <div className="text-lg text-muted-foreground line-through">
                            ₹{originalRupees}
                          </div>
                          <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">
                            ₹{rupees}
                            <span className="text-base font-normal text-muted-foreground"> / {duration}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-3xl sm:text-4xl font-bold">
                          ₹{rupees}
                          <span className="text-base font-normal text-muted-foreground"> / {duration}</span>
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 sm:gap-3">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      variant={isPopular ? 'default' : 'outline'} 
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
