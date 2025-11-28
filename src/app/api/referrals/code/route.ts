import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { referrals } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/referrals/code
 * Get user's referral code and stats
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

    // Generate referral code if doesn't exist
    const code = `REF${user.id.slice(0, 8).toUpperCase()}`;

    // Get referral stats
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, user.id));

    const stats = {
      totalReferrals: userReferrals.length,
      pendingReferrals: userReferrals.filter(r => r.status === 'pending').length,
      completedReferrals: userReferrals.filter(r => r.status === 'completed').length,
      rewardedReferrals: userReferrals.filter(r => r.status === 'rewarded').length,
    };

    return NextResponse.json({
      success: true,
      referralCode: code,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?ref=${code}`,
      stats,
      referrals: userReferrals.map(r => ({
        id: r.id,
        status: r.status,
        rewardType: r.rewardType,
        rewardApplied: r.rewardApplied,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching referral code:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch referral code',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referrals/code
 * Apply referral code during signup
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

    const { referralCode } = await req.json();

    if (!referralCode) {
      return NextResponse.json(
        { success: false, error: 'Referral code required' },
        { status: 400 }
      );
    }

    // Extract referrer ID from code
    const referrerId = referralCode.replace('REF', '').toLowerCase();
    
    // Don't allow self-referral
    if (user.id.startsWith(referrerId)) {
      return NextResponse.json(
        { success: false, error: 'Cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Create referral record
    const [referral] = await db
      .insert(referrals)
      .values({
        referrerId: `${referrerId}-${user.id.slice(8)}`, // Reconstruct full UUID
        referredUserId: user.id,
        referralCode: referralCode,
        status: 'pending',
      })
      .returning();

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Failed to create referral record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Referral code applied! Both you and your referrer will get rewards when you subscribe.',
      referral: {
        id: referral.id,
        status: referral.status,
      },
    });
  } catch (error: any) {
    console.error('Error applying referral code:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to apply referral code',
      },
      { status: 500 }
    );
  }
}
