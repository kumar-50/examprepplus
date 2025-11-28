'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';
import { Loader2 } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const planId = searchParams.get('plan');

  useEffect(() => {
    if (!planId) {
      // No plan selected, redirect to home
      router.push('/');
      return;
    }

    // Auto-open payment modal
    setIsModalOpen(true);
  }, [planId, router]);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/');
  };

  if (!planId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Opening Payment...</h1>
        <p className="text-muted-foreground">Please wait while we prepare your checkout</p>
      </div>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={handleClose}
        planId={planId}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
