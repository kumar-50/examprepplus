import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes, promoCodeUsages } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single promo code with usage stats
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.id, id))
      .limit(1);

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Get usage count
    const [usageStats] = await db
      .select({ count: count() })
      .from(promoCodeUsages)
      .where(eq(promoCodeUsages.promoCodeId, id));

    return NextResponse.json({
      success: true,
      promoCode,
      usageCount: usageStats?.count || 0,
    });
  } catch (error: any) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch promo code' },
      { status: 500 }
    );
  }
}

// PUT - Update promo code
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
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

    // Check if promo code exists
    const [existing] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== existing.code) {
      const [duplicate] = await db
        .select()
        .from(promoCodes)
        .where(eq(promoCodes.code, code.toUpperCase()))
        .limit(1);

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'Promo code already exists' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (applicablePlanId !== undefined) updateData.applicablePlanId = applicablePlanId || null;
    if (body.applicablePlanIds !== undefined) updateData.applicablePlanIds = body.applicablePlanIds;
    if (maxUses !== undefined) updateData.maxUses = maxUses ? Number(maxUses) : null;
    if (maxUsesPerUser !== undefined) updateData.maxUsesPerUser = maxUsesPerUser ? Number(maxUsesPerUser) : 1;
    if (validFrom !== undefined) updateData.validFrom = validFrom ? new Date(validFrom) : null;
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (body.isGlobal !== undefined) updateData.isGlobal = body.isGlobal;
    if (body.appliedBy !== undefined) updateData.appliedBy = body.appliedBy;

    const [updated] = await db
      .update(promoCodes)
      .set(updateData)
      .where(eq(promoCodes.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      promoCode: updated,
      message: 'Promo code updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

// DELETE - Delete promo code
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if promo code exists
    const [existing] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Check if promo code has been used
    const [usageStats] = await db
      .select({ count: count() })
      .from(promoCodeUsages)
      .where(eq(promoCodeUsages.promoCodeId, id));

    if (usageStats && usageStats.count > 0) {
      // Instead of deleting, deactivate it
      await db
        .update(promoCodes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(promoCodes.id, id));

      return NextResponse.json({
        success: true,
        message: 'Promo code has been used and was deactivated instead of deleted',
        deactivated: true,
      });
    }

    // Delete usage records first (if any)
    await db.delete(promoCodeUsages).where(eq(promoCodeUsages.promoCodeId, id));

    // Delete the promo code
    await db.delete(promoCodes).where(eq(promoCodes.id, id));

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}
