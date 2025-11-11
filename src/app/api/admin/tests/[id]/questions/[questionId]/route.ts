import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { tests, testQuestions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * DELETE /api/admin/tests/[id]/questions/[questionId]
 * Remove a question from a test
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    await requireAdmin();
    const { id: testId, questionId } = await params;

    // Check if test question exists
    const existing = await db
      .select()
      .from(testQuestions)
      .where(
        and(
          eq(testQuestions.testId, testId),
          eq(testQuestions.questionId, questionId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Question not found in this test' },
        { status: 404 }
      );
    }

    // Delete the test question
    await db
      .delete(testQuestions)
      .where(
        and(
          eq(testQuestions.testId, testId),
          eq(testQuestions.questionId, questionId)
        )
      );

    // Update test's total questions and total marks
    const allTestQuestions = await db
      .select({
        marks: testQuestions.marks,
      })
      .from(testQuestions)
      .where(eq(testQuestions.testId, testId));

    const totalQuestions = allTestQuestions.length;
    const totalMarks = allTestQuestions.reduce((sum, q) => sum + q.marks, 0);

    await db
      .update(tests)
      .set({
        totalQuestions,
        totalMarks,
        updatedAt: new Date(),
      })
      .where(eq(tests.id, testId));

    return NextResponse.json({
      message: 'Question removed from test successfully',
      totalQuestions,
      totalMarks,
    });
  } catch (error: any) {
    console.error('Error removing question from test:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove question from test' },
      { status: error.status || 500 }
    );
  }
}
