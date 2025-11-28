'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

interface PricingCardProps {
  planId: string;
  name: string;
  description: string;
  price: number; // in paise
  currency: string;
  durationDays: number;
  features: string[];
  isPopular?: boolean;
  isLimited?: boolean;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
}

export function PricingCard({
  planId,
  name,
  description,
  price,
  currency,
  durationDays,
  features,
  isPopular = false,
  isLimited = false,
  onSubscribe,
  isLoading = false,
}: PricingCardProps) {
  const rupees = price / 100;
  const perMonth = durationDays > 0 ? Math.round(rupees / (durationDays / 30)) : rupees;

  // Calculate savings
  let savings = 0;
  let savingsPercent = 0;
  if (durationDays === 180) {
    // Half-yearly: Compare to 6 months of monthly (₹99 × 6 = ₹594)
    savings = 594 - rupees;
    savingsPercent = Math.round((savings / 594) * 100);
  } else if (durationDays === 365) {
    // Yearly: Compare to 12 months of monthly (₹99 × 12 = ₹1,188)
    const monthlyTotal = 1188;
    savings = monthlyTotal - rupees;
    savingsPercent = Math.round((savings / monthlyTotal) * 100);
  }

  return (
    <Card
      className={`relative flex flex-col ${
        isPopular
          ? 'border-primary shadow-lg scale-105'
          : 'border-border'
      } transition-all hover:shadow-lg`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
            ⭐ MOST POPULAR
          </Badge>
        </div>
      )}

      {/* Limited Badge */}
      {isLimited && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-orange-500 text-white px-4 py-1 text-sm font-semibold animate-pulse">
            🔥 LIMITED OFFER
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription className="text-sm min-h-[40px]">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">₹{rupees}</span>
            <span className="text-muted-foreground">
              /{durationDays} days
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            ₹{perMonth}/month effective cost
          </p>
          {savings > 0 && (
            <Badge variant="secondary" className="mt-2">
              Save ₹{savings} ({savingsPercent}% OFF)
            </Badge>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <div className="rounded-full bg-primary/10 p-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{feature}</p>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSubscribe(planId)}
          disabled={isLoading}
          className="w-full"
          size="lg"
          variant={isPopular ? 'default' : 'outline'}
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            <>
              {isLimited && <Sparkles className="mr-2 h-4 w-4" />}
              Get Started
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
