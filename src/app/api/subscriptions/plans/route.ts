import { NextRequest, NextResponse } from 'next/server';
import { getAllSubscriptionPlans } from '@/lib/subscription-utils';
import { db } from '@/db';
import { promoCodes } from '@/db/schema';
import { and, eq, gte, lte, or, isNull, lt } from 'drizzle-orm';

/**
 * GET /api/subscriptions/plans
 * Fetch all active subscription plans with global promo codes
 */
export async function GET(req: NextRequest) {
  try {
    const plans = await getAllSubscriptionPlans();
    
    // Fetch active global promo codes applied by admin
    const now = new Date();
    const globalPromos = await db
      .select()
      .from(promoCodes)
      .where(
        and(
          eq(promoCodes.isActive, true),
          eq(promoCodes.isGlobal, true),
          eq(promoCodes.appliedBy, 'admin'),
          lte(promoCodes.validFrom, now),
          or(
            isNull(promoCodes.validUntil),
            gte(promoCodes.validUntil, now)
          ),
          or(
            isNull(promoCodes.maxUses),
            lt(promoCodes.currentUses, promoCodes.maxUses)
          )
        )
      );

    return NextResponse.json({
      success: true,
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        durationDays: plan.durationDays,
        features: plan.features ? JSON.parse(plan.features) : [],
        displayOrder: plan.displayOrder,
      })),
      globalPromos: globalPromos.map((promo) => ({
        id: promo.id,
        code: promo.code,
        name: promo.name,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        applicablePlanId: promo.applicablePlanId,
        applicablePlanIds: promo.applicablePlanIds,
      })),
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
