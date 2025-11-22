import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { getOverviewStats } from '@/lib/analytics/queries';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const stats = await getOverviewStats(user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    // Return default empty stats instead of error object
    return NextResponse.json({
      totalTests: 0,
      totalQuestions: 0,
      overallAccuracy: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      testsThisWeek: 0,
    });
  }
}
