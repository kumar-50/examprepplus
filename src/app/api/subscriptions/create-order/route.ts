import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { getSubscriptionPlan } from '@/lib/subscription-utils';
import { db } from '@/db';
import { paymentAnalytics, promoCodes, promoCodeUsages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/subscriptions/create-order
 * Create a Razorpay order for subscription purchase
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planId, promoCode } = body;

    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Fetch the subscription plan
    const plan = await getSubscriptionPlan(planId);

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription plan' },
        { status: 404 }
      );
    }

    let finalPrice = plan.price;
    let appliedPromoCode = null;
    let discountAmount = 0;

    // Apply promo code if provided
    if (promoCode) {
      const [promo] = await db
        .select()
        .from(promoCodes)
        .where(eq(promoCodes.code, promoCode.toUpperCase()));

      if (promo && promo.isActive) {
        // Validate promo code
        const now = new Date();
        const isValid =
          promo.validFrom <= now &&
          (!promo.validUntil || promo.validUntil >= now) &&
          (!promo.maxUses || promo.currentUses < promo.maxUses) &&
          (!promo.applicablePlanId || promo.applicablePlanId === planId);

        // Check user usage
        const userUsages = await db
          .select()
          .from(promoCodeUsages)
          .where(
            and(
              eq(promoCodeUsages.promoCodeId, promo.id),
              eq(promoCodeUsages.userId, user.id)
            )
          );

        if (isValid && userUsages.length < promo.maxUsesPerUser) {
          // Calculate discount
          if (promo.discountType === 'percentage') {
            discountAmount = Math.round((plan.price * promo.discountValue) / 100);
          } else {
            discountAmount = promo.discountValue;
          }
          finalPrice = Math.max(0, plan.price - discountAmount);
          appliedPromoCode = promo;
        }
      }
    }

    // Create Razorpay order
    // Receipt must be <= 40 chars, so we use a short format
    const shortUserId = user.id.slice(0, 8); // First 8 chars of UUID
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const receipt = `sub_${shortUserId}_${timestamp}`; // Format: sub_12345678_12345678 (28 chars)
    
    const order = await createRazorpayOrder({
      amount: finalPrice,
      currency: plan.currency,
      receipt: receipt,
      notes: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        promoCode: appliedPromoCode?.code || '',
        discountAmount: String(discountAmount),
        originalPrice: String(plan.price),
      },
    });

    // Track payment initiation
    try {
      await db.insert(paymentAnalytics).values({
        userId: user.id,
        event: 'payment_initiated',
        planId: plan.id,
        amount: finalPrice,
        currency: plan.currency,
        razorpayOrderId: order.id,
        metadata: JSON.stringify({
          planName: plan.name,
          durationDays: plan.durationDays,
          promoCode: appliedPromoCode?.code || null,
          originalPrice: plan.price,
          discountAmount: discountAmount,
        }),
      });
    } catch (analyticsError) {
      console.error('Failed to log payment analytics:', analyticsError);
      // Don't fail the order creation if analytics fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
      },
      discount: appliedPromoCode ? {
        code: appliedPromoCode.code,
        originalPrice: plan.price,
        discountAmount: discountAmount,
        finalPrice: finalPrice,
      } : null,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create order',
      },
      { status: 500 }
    );
  }
}
