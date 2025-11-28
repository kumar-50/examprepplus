import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getUserSubscription } from '@/lib/subscription-utils';
import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/subscriptions/status
 * Get current user's subscription status
 */
export async function GET(req: NextRequest) {
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

    const subscription = await getUserSubscription(user.id);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        hasActiveSubscription: false,
        subscription: null,
        daysRemaining: 0,
        expiresAt: null,
      });
    }

    // Calculate days remaining
    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const daysRemaining = endDate 
      ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    // Get plan details for price and duration
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, subscription.planId))
      .limit(1);

    return NextResponse.json({
      success: true,
      hasActiveSubscription: subscription.isActive,
      subscription: {
        id: subscription.id,
        planName: subscription.planName,
        status: subscription.status,
        isActive: subscription.isActive,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        price: plan?.price || 0,
        durationDays: plan?.durationDays || 0,
      },
      daysRemaining,
      expiresAt: subscription.endDate,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
