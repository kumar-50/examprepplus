import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { paymentAnalytics } from '@/db/schema';
import { eq, desc, gte, sql } from 'drizzle-orm';

/**
 * GET /api/admin/analytics
 * Get payment analytics and conversion metrics
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

    // Check if user is admin by role
    const { db } = await import('@/db');
    const { users } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    
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

    // Get date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get payment events
    const events = await db
      .select()
      .from(paymentAnalytics)
      .where(gte(paymentAnalytics.timestamp, thirtyDaysAgo))
      .orderBy(desc(paymentAnalytics.timestamp));

    // Calculate metrics
    const totalInitiated = events.filter(e => e.event === 'payment_initiated').length;
    const totalSuccess = events.filter(e => e.event === 'payment_success').length;
    const totalFailed = events.filter(e => e.event === 'payment_failed').length;

    const conversionRate = totalInitiated > 0 
      ? Math.round((totalSuccess / totalInitiated) * 100) 
      : 0;

    // Revenue by payment method
    const revenueByMethod = events
      .filter(e => e.event === 'payment_success' && e.amount)
      .reduce((acc, e) => {
        const method = e.paymentMethod || 'unknown';
        acc[method] = (acc[method] || 0) + (e.amount || 0);
        return acc;
      }, {} as Record<string, number>);

    // Daily revenue (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRevenue = events
      .filter(e => e.event === 'payment_success' && e.timestamp >= sevenDaysAgo)
      .reduce((acc, e) => {
        const date = new Date(e.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + (e.amount || 0);
        return acc;
      }, {} as Record<string, number>);

    // Common failure reasons
    const failureReasons = events
      .filter(e => e.event === 'payment_failed' && e.errorCode)
      .reduce((acc, e) => {
        const reason = e.errorMessage || e.errorCode || 'Unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      metrics: {
        totalInitiated,
        totalSuccess,
        totalFailed,
        conversionRate,
        failureRate: totalInitiated > 0 
          ? Math.round((totalFailed / totalInitiated) * 100) 
          : 0,
      },
      revenueByMethod: Object.entries(revenueByMethod).map(([method, amount]) => ({
        method,
        amount: Math.round(amount / 100), // Convert to rupees
      })),
      dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        amount: Math.round(amount / 100),
      })),
      failureReasons: Object.entries(failureReasons)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      recentEvents: events.slice(0, 20).map(e => ({
        id: e.id,
        event: e.event,
        amount: e.amount ? Math.round(e.amount / 100) : null,
        paymentMethod: e.paymentMethod,
        timestamp: e.timestamp,
        errorMessage: e.errorMessage,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}
