import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { db } from '@/db';
import { subscriptions, paymentAnalytics, referrals } from '@/db/schema';
import { calculateEndDate, updateUserSubscriptionStatus } from '@/lib/subscription-utils';
import { eq } from 'drizzle-orm';

/**
 * POST /api/subscriptions/verify
 * Verify Razorpay payment and activate subscription
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      durationDays,
    } = body;

    // Validate required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !planId ||
      !durationDays
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    console.log('🔐 Payment signature verification:', isValid ? '✅ Valid' : '❌ Invalid');

    if (!isValid) {
      // Track failed payment
      try {
        await db.insert(paymentAnalytics).values({
          userId: user.id,
          event: 'payment_failed',
          planId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          errorCode: 'SIGNATURE_VERIFICATION_FAILED',
          errorMessage: 'Payment signature verification failed',
        });
      } catch (analyticsError) {
        console.error('Failed to log payment analytics:', analyticsError);
      }

      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = calculateEndDate(startDate, durationDays);

    console.log('📅 Subscription dates:', { startDate, endDate, durationDays });
    console.log('💾 Creating subscription for user:', user.id);

    // Create subscription record
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId: user.id,
        planId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: 'completed',
        startDate,
        endDate,
      })
      .returning();

    if (!subscription) {
      throw new Error('Failed to create subscription record');
    }

    console.log('✅ Subscription created:', subscription.id);

    // Update user's subscription status
    await updateUserSubscriptionStatus(user.id, 'active');

    console.log('✅ User status updated to active');

    // Track successful payment
    try {
      // Get plan amount from the order (we need to fetch it)
      // For now, we'll track without amount - can enhance later
      await db.insert(paymentAnalytics).values({
        userId: user.id,
        subscriptionId: subscription.id,
        event: 'payment_success',
        planId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        metadata: JSON.stringify({
          durationDays,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        }),
      });
    } catch (analyticsError) {
      console.error('Failed to log payment analytics:', analyticsError);
      // Don't fail the subscription if analytics fails
    }

    // Update referral status if user was referred
    try {
      const pendingReferrals = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referredUserId, user.id));

      if (pendingReferrals.length > 0) {
        for (const referral of pendingReferrals) {
          if (referral.status === 'pending') {
            // Mark referral as completed
            await db
              .update(referrals)
              .set({
                status: 'completed',
                subscriptionId: subscription.id,
                completedAt: new Date(),
              })
              .where(eq(referrals.id, referral.id));

            console.log('✅ Referral completed:', referral.id);

            // Check if referrer should get reward (every 5 completed referrals)
            const referrerCompletedReferrals = await db
              .select()
              .from(referrals)
              .where(eq(referrals.referrerId, referral.referrerId));

            const completedCount = referrerCompletedReferrals.filter(
              r => r.status === 'completed' || r.status === 'rewarded'
            ).length;

            // Award reward at milestones: 5, 10, 15, etc.
            if (completedCount % 5 === 0) {
              const unrewardedReferrals = referrerCompletedReferrals
                .filter(r => r.status === 'completed')
                .slice(0, 5);

              // Mark these 5 referrals as rewarded
              for (const r of unrewardedReferrals) {
                await db
                  .update(referrals)
                  .set({
                    status: 'rewarded',
                    rewardType: 'free_month',
                    rewardApplied: true,
                  })
                  .where(eq(referrals.id, r.id));
              }

              console.log(`🎁 Reward granted to referrer ${referral.referrerId} for ${completedCount} referrals`);
            }
          }
        }
      }
    } catch (referralError) {
      console.error('Failed to update referral status:', referralError);
      // Don't fail the subscription if referral update fails
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: 'active',
      },
      message: 'Subscription activated successfully!',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify payment',
      },
      { status: 500 }
    );
  }
}
