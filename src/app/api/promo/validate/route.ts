import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { promoCodes, promoCodeUsages, subscriptionPlans } from '@/db/schema';
import { eq, and, gte, lte, or, isNull } from 'drizzle-orm';

/**
 * POST /api/promo/validate
 * Validate a promo code and return discount details
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
    const { code, planId } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    // Find the promo code
    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, code.toUpperCase()));

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid promo code' },
        { status: 404 }
      );
    }

    // Check if active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { success: false, error: 'This promo code is no longer active' },
        { status: 400 }
      );
    }

    // Check validity period
    const now = new Date();
    if (promoCode.validFrom > now) {
      return NextResponse.json(
        { success: false, error: 'This promo code is not yet valid' },
        { status: 400 }
      );
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
      return NextResponse.json(
        { success: false, error: 'This promo code has expired' },
        { status: 400 }
      );
    }

    // Check max uses
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { success: false, error: 'This promo code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check if user has already used this code
    const userUsages = await db
      .select()
      .from(promoCodeUsages)
      .where(
        and(
          eq(promoCodeUsages.promoCodeId, promoCode.id),
          eq(promoCodeUsages.userId, user.id)
        )
      );

    if (userUsages.length >= promoCode.maxUsesPerUser) {
      return NextResponse.json(
        { success: false, error: 'You have already used this promo code' },
        { status: 400 }
      );
    }

    // Check plan applicability - support both old single plan and new multi-plan
    const applicablePlanIds = promoCode.applicablePlanIds as string[] | null;
    if (planId) {
      // If applicablePlanIds array exists, use that
      if (applicablePlanIds && applicablePlanIds.length > 0) {
        if (!applicablePlanIds.includes(planId)) {
          return NextResponse.json(
            { success: false, error: 'This promo code is not valid for the selected plan' },
            { status: 400 }
          );
        }
      } else if (promoCode.applicablePlanId && promoCode.applicablePlanId !== planId) {
        // Fallback to old single plan check
        return NextResponse.json(
          { success: false, error: 'This promo code is not valid for the selected plan' },
          { status: 400 }
        );
      }
    }

    // Get applicable plan names
    let applicablePlanNames: string[] = [];
    if (applicablePlanIds && applicablePlanIds.length > 0) {
      const plans = await db
        .select({ id: subscriptionPlans.id, name: subscriptionPlans.name })
        .from(subscriptionPlans);
      applicablePlanNames = plans
        .filter(p => applicablePlanIds.includes(p.id))
        .map(p => p.name);
    } else if (promoCode.applicablePlanId) {
      const [plan] = await db
        .select({ name: subscriptionPlans.name })
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, promoCode.applicablePlanId));
      if (plan) applicablePlanNames = [plan.name];
    }

    return NextResponse.json({
      success: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        name: promoCode.name,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        applicablePlanId: promoCode.applicablePlanId,
        applicablePlanIds: applicablePlanIds,
        applicablePlanNames: applicablePlanNames.join(', ') || 'All Plans',
      },
      message: `Promo code applied! ${promoCode.discountType === 'percentage' ? promoCode.discountValue + '% OFF' : '₹' + (promoCode.discountValue / 100) + ' OFF'}`,
    });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
