import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { tests, testQuestions, questions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * PATCH /api/admin/tests/[id]/questions/[questionId]
 * Update a question in a test
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    await requireAdmin();
    const { id: testId, questionId } = await params;
    const body = await request.json();

    const {
      questionText,
      option1,
      option2,
      option3,
      option4,
      correctOption,
      marks,
    } = body;

    // Validate required fields
    if (!questionText || !option1 || !option2 || !option3 || !option4) {
      return NextResponse.json(
        { error: 'All question fields are required' },
        { status: 400 }
      );
    }

    // Validate correctOption
    if (!correctOption || correctOption < 1 || correctOption > 4) {
      return NextResponse.json(
        { error: 'Correct option must be between 1 and 4' },
        { status: 400 }
      );
    }

    // Validate marks
    if (marks === undefined || marks < 0) {
      return NextResponse.json(
        { error: 'Marks must be a positive number' },
        { status: 400 }
      );
    }

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

    if (existing.length === 0 || !existing[0]) {
      return NextResponse.json(
        { error: 'Question not found in this test' },
        { status: 404 }
      );
    }

    const oldMarks = existing[0].marks;

    // Update the question in the questions table
    await db
      .update(questions)
      .set({
        questionText,
        option1,
        option2,
        option3,
        option4,
        correctOption,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    // Update marks in test_questions if changed
    if (marks !== oldMarks) {
      await db
        .update(testQuestions)
        .set({
          marks,
        })
        .where(
          and(
            eq(testQuestions.testId, testId),
            eq(testQuestions.questionId, questionId)
          )
        );

      // Recalculate test totals
      const allTestQuestions = await db
        .select({
          marks: testQuestions.marks,
        })
        .from(testQuestions)
        .where(eq(testQuestions.testId, testId));

      const totalMarks = allTestQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

      await db
        .update(tests)
        .set({
          totalMarks,
          updatedAt: new Date(),
        })
        .where(eq(tests.id, testId));
    }

    return NextResponse.json({
      message: 'Question updated successfully',
      question: {
        id: questionId,
        questionText,
        option1,
        option2,
        option3,
        option4,
        correctOption,
        marks,
      },
    });
  } catch (error: any) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update question' },
      { status: error.status || 500 }
    );
  }
}

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
    const totalMarks = (allTestQuestions || []).reduce((sum, q) => sum + (q.marks || 0), 0);

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
