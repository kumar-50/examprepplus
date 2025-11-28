'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PricingCard } from '@/components/subscription/pricing-card';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

function PricingContent() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    // Auto-open modal if plan is specified in URL
    const planId = searchParams.get('plan');
    if (planId && plans.length > 0) {
      setSelectedPlanId(planId);
      setIsModalOpen(true);
    }
  }, [searchParams, plans]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlanId(planId);
    setIsModalOpen(true);
  };

  // Separate plans
  const regularPlans = plans.filter(
    (p) => !p.name.includes('Early Bird') && !p.name.includes('Early Adopter')
  );
  const earlyBirdPlan = plans.find((p) => p.name.includes('Early Bird'));
  const earlyAdopterPlan = plans.find((p) => p.name.includes('Early Adopter'));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <Badge className="mb-4" variant="secondary">
            🚂 Railways Exam Preparation
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Master Railways. Master Your Future.
          </h1>
          <p className="text-xl text-muted-foreground">
            Unlimited mock tests, practice quizzes, and advanced analytics.
            <br />
            One price. All Railway exams.
          </p>
        </div>

        {/* Early Bird Section */}
        {(earlyBirdPlan || earlyAdopterPlan) && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-orange-500" />
                Limited Time Offers
              </h2>
              <p className="text-muted-foreground">
                Special pricing for early supporters
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {earlyBirdPlan && (
                <PricingCard
                  planId={earlyBirdPlan.id}
                  name={earlyBirdPlan.name}
                  description={earlyBirdPlan.description}
                  price={earlyBirdPlan.price}
                  currency={earlyBirdPlan.currency}
                  durationDays={earlyBirdPlan.durationDays}
                  features={earlyBirdPlan.features}
                  isLimited={true}
                  onSubscribe={handleSubscribe}
                  isLoading={isLoading}
                />
              )}
              {earlyAdopterPlan && (
                <PricingCard
                  planId={earlyAdopterPlan.id}
                  name={earlyAdopterPlan.name}
                  description={earlyAdopterPlan.description}
                  price={earlyAdopterPlan.price}
                  currency={earlyAdopterPlan.currency}
                  durationDays={earlyAdopterPlan.durationDays}
                  features={earlyAdopterPlan.features}
                  isLimited={true}
                  onSubscribe={handleSubscribe}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        )}

        {/* Regular Plans */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Regular Pricing</h2>
            <p className="text-muted-foreground">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {regularPlans.map((plan, index) => (
              <PricingCard
                key={plan.id}
                planId={plan.id}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                currency={plan.currency}
                durationDays={plan.durationDays}
                features={plan.features}
                isPopular={index === 2} // Yearly is most popular
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Free Tier Info */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="rounded-lg border bg-muted/50 p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Not Ready to Subscribe?</h3>
            <p className="text-muted-foreground mb-6">
              Try our free tier with limited access
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">5 mock tests</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">50 questions/day</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">7-day analytics</span>
              </div>
            </div>
            <Link href="/signup">
              <Button variant="outline" size="lg">
                Start Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why ExamPrepPlus?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <ValueCard
              title="100% Railways Focused"
              description="Not diluted across 500 exams. We specialize in Railways only."
            />
            <ValueCard
              title="Quality Over Quantity"
              description="Curated questions verified by experts, not auto-generated tests."
            />
            <ValueCard
              title="Advanced Analytics"
              description="AI-powered weak topic detection and exam readiness scoring."
            />
            <ValueCard
              title="Future-Proof"
              description="All future Railway exams (Group D, ALP, RPF) included FREE."
            />
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planId={selectedPlanId}
      />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <PricingContent />
    </Suspense>
  );
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
