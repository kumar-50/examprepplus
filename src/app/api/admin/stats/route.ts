import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { subscriptions, users, subscriptionPlans } from '@/db/schema';
import { eq, desc, gte, count, sql } from 'drizzle-orm';

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
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

    // Check if user is admin (you can add admin flag to users table)
    // For now, using email check - REPLACE WITH YOUR EMAIL
    // Check if user is admin by role
    const [userProfile] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id));

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get total users
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get active subscriptions
    const now = new Date();
    const activeSubsResult = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(gte(subscriptions.endDate, now));
    const activeSubscriptions = activeSubsResult[0]?.count || 0;

    // Get total revenue (sum of all completed payments)
    const revenueResult = await db
      .select({
        total: sql<number>`SUM(${subscriptionPlans.price})`,
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.paymentStatus, 'completed'));
    
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get recent subscriptions
    const recentSubscriptions = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        userEmail: users.email,
        planName: subscriptionPlans.name,
        price: subscriptionPlans.price,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        paymentStatus: subscriptions.paymentStatus,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(10);

    // Get plan distribution
    const planDistribution = await db
      .select({
        planName: subscriptionPlans.name,
        count: count(),
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(gte(subscriptions.endDate, now))
      .groupBy(subscriptionPlans.name);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions,
        totalRevenue: Math.round(totalRevenue / 100), // Convert paise to rupees
        freeUsers: totalUsers - activeSubscriptions,
      },
      recentSubscriptions,
      planDistribution,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch admin stats',
      },
      { status: 500 }
    );
  }
}
