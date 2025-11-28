import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes, promoCodeUsages, subscriptionPlans } from '@/db/schema';
import { eq, desc, sql, count } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/server';

// GET - List all promo codes
export async function GET() {
  try {
    await requireAdmin();

    const codes = await db
      .select({
        id: promoCodes.id,
        code: promoCodes.code,
        name: promoCodes.name,
        description: promoCodes.description,
        discountType: promoCodes.discountType,
        discountValue: promoCodes.discountValue,
        applicablePlanId: promoCodes.applicablePlanId,
        applicablePlanIds: promoCodes.applicablePlanIds,
        maxUses: promoCodes.maxUses,
        currentUses: promoCodes.currentUses,
        maxUsesPerUser: promoCodes.maxUsesPerUser,
        validFrom: promoCodes.validFrom,
        validUntil: promoCodes.validUntil,
        isActive: promoCodes.isActive,
        isGlobal: promoCodes.isGlobal,
        appliedBy: promoCodes.appliedBy,
        createdAt: promoCodes.createdAt,
        updatedAt: promoCodes.updatedAt,
      })
      .from(promoCodes)
      .orderBy(desc(promoCodes.createdAt));

    // Get plan names for display
    const plans = await db
      .select({ id: subscriptionPlans.id, name: subscriptionPlans.name })
      .from(subscriptionPlans);

    const planMap = new Map(plans.map((p) => [p.id, p.name]));

    const codesWithPlanNames = codes.map((code) => {
      // Handle multiple plan IDs
      let applicablePlanNames = 'All Plans';
      if (code.applicablePlanIds && code.applicablePlanIds.length > 0) {
        const names = code.applicablePlanIds
          .map(id => planMap.get(id))
          .filter(Boolean);
        applicablePlanNames = names.length > 0 ? names.join(', ') : 'All Plans';
      } else if (code.applicablePlanId) {
        // Backward compatibility
        applicablePlanNames = planMap.get(code.applicablePlanId) || 'Unknown';
      }
      
      return {
        ...code,
        applicablePlanNames,
      };
    });

    return NextResponse.json({
      success: true,
      promoCodes: codesWithPlanNames,
    });
  } catch (error: any) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

// POST - Create new promo code
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      applicablePlanId,
      maxUses,
      maxUsesPerUser,
      validFrom,
      validUntil,
      isActive,
    } = body;

    // Validate required fields
    if (!code || !name || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Code, name, discount type, and discount value are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const [existing] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, code.toUpperCase()))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Promo code already exists' },
        { status: 400 }
      );
    }

    // Create promo code
    const insertData: any = {
      code: code.toUpperCase(),
      name,
      discountType,
      discountValue: Number(discountValue),
      isActive: isActive !== false,
      currentUses: 0,
      isGlobal: body.isGlobal || false,
      appliedBy: body.appliedBy || 'user',
    };
    
    if (description) insertData.description = description;
    if (body.applicablePlanIds && body.applicablePlanIds.length > 0) {
      insertData.applicablePlanIds = body.applicablePlanIds;
    }
    if (maxUses) insertData.maxUses = Number(maxUses);
    if (maxUsesPerUser) insertData.maxUsesPerUser = Number(maxUsesPerUser);
    if (validFrom) insertData.validFrom = new Date(validFrom);
    if (validUntil) insertData.validUntil = new Date(validUntil);
    
    const [newCode] = await db
      .insert(promoCodes)
      .values(insertData)
      .returning();

    return NextResponse.json({
      success: true,
      promoCode: newCode,
      message: 'Promo code created successfully',
    });
  } catch (error: any) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create promo code' },
      { status: 500 }
    );
  }
}
