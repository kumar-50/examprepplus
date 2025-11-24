import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { userGoals } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/progress/goals
 * Get all goals for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db.select().from(userGoals).where(eq(userGoals.userId, user.id));

    if (status) {
      query = db
        .select()
        .from(userGoals)
        .where(and(eq(userGoals.userId, user.id), eq(userGoals.status, status as any)));
    }

    const goals = await query;

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress/goals
 * Create a new goal
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const {
      goalType,
      goalCategory,
      targetValue,
      periodStart,
      periodEnd,
      sectionId,
    } = body;

    // Validate required fields
    if (!goalType || !goalCategory || !targetValue || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newGoal] = await db
      .insert(userGoals)
      .values({
        userId: user.id,
        goalType,
        goalCategory,
        targetValue: targetValue.toString(),
        periodStart,
        periodEnd,
        sectionId: sectionId || null,
        status: 'active',
      })
      .returning();

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
