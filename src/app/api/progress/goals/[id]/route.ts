import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { userGoals } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * PUT /api/progress/goals/[id]
 * Update a goal
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { currentValue, status, targetValue } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (currentValue !== undefined) {
      updateData.currentValue = currentValue.toString();
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (targetValue !== undefined) {
      updateData.targetValue = targetValue.toString();
    }

    const [updatedGoal] = await db
      .update(userGoals)
      .set(updateData)
      .where(and(eq(userGoals.id, id), eq(userGoals.userId, user.id)))
      .returning();

    if (!updatedGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/progress/goals/[id]
 * Delete a goal
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    await db
      .delete(userGoals)
      .where(and(eq(userGoals.id, id), eq(userGoals.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
