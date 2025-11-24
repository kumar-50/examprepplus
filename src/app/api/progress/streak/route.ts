import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { userTestAttempts } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateStreak, getStreakCalendar, getStreakMilestone } from '@/lib/streak-calculator';

/**
 * GET /api/progress/streak
 * Get study streak information for the current user
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all activity dates (submitted tests)
    const activityDates = await db
      .select({
        date: sql<Date>`DATE(${userTestAttempts.submittedAt})`,
      })
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.userId, user.id),
          eq(userTestAttempts.status, 'submitted')
        )
      )
      .groupBy(sql`DATE(${userTestAttempts.submittedAt})`);

    const dates = activityDates.map((d) => new Date(d.date));

    // Calculate streak
    const streakData = calculateStreak(dates);

    // Get calendar for visualization
    const calendar = getStreakCalendar(dates, 30);

    // Get milestone info
    const milestone = getStreakMilestone(streakData.currentStreak);

    return NextResponse.json({
      ...streakData,
      calendar,
      milestone,
    });
  } catch (error) {
    console.error('Error calculating streak:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
