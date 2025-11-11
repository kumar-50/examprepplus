import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { tests, testQuestions, questions, sections } from '@/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';

const addQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      questionId: z.string().uuid(),
      marks: z.number().int().min(1),
      sectionId: z.string().uuid().optional().nullable(),
    })
  ).min(1, 'At least one question is required'),
});

const reorderQuestionsSchema = z.object({
  questionOrders: z.array(
    z.object({
      id: z.string().uuid(), // testQuestion id
      questionOrder: z.number().int().min(1),
    })
  ),
});

/**
 * GET /api/admin/tests/[id]/questions
 * Get all questions for a test with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: testId } = await params;

    // Verify test exists
    const test = await db
      .select()
      .from(tests)
      .where(eq(tests.id, testId))
      .limit(1);

    if (test.length === 0) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Get test questions with question details
    const testQuestionsList = await db
      .select({
        id: testQuestions.id,
        testId: testQuestions.testId,
        questionId: testQuestions.questionId,
        questionOrder: testQuestions.questionOrder,
        marks: testQuestions.marks,
        sectionId: testQuestions.sectionId,
        sectionName: sections.name,
        questionText: questions.questionText,
        option1: questions.option1,
        option2: questions.option2,
        option3: questions.option3,
        option4: questions.option4,
        correctOption: questions.correctOption,
        explanation: questions.explanation,
        difficultyLevel: questions.difficultyLevel,
        hasEquation: questions.hasEquation,
        imageUrl: questions.imageUrl,
      })
      .from(testQuestions)
      .leftJoin(questions, eq(testQuestions.questionId, questions.id))
      .leftJoin(sections, eq(testQuestions.sectionId, sections.id))
      .where(eq(testQuestions.testId, testId))
      .orderBy(testQuestions.questionOrder);

    // Get section-wise breakdown
    const sectionBreakdown = await db
      .select({
        sectionId: testQuestions.sectionId,
        sectionName: sections.name,
        count: sql<number>`count(*)::int`,
        totalMarks: sql<number>`sum(${testQuestions.marks})::int`,
      })
      .from(testQuestions)
      .leftJoin(sections, eq(testQuestions.sectionId, sections.id))
      .where(eq(testQuestions.testId, testId))
      .groupBy(testQuestions.sectionId, sections.name);

    return NextResponse.json({
      questions: testQuestionsList,
      sectionBreakdown,
      totalQuestions: testQuestionsList.length,
      totalMarks: testQuestionsList.reduce((sum, q) => sum + (q.marks || 0), 0),
    });
  } catch (error: any) {
    console.error('Error fetching test questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch test questions' },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/admin/tests/[id]/questions
 * Add multiple questions to a test (bulk operation)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: testId } = await params;

    const body = await request.json();
    const { questions: questionsToAdd } = addQuestionsSchema.parse(body);

    // Verify test exists
    const test = await db
      .select()
      .from(tests)
      .where(eq(tests.id, testId))
      .limit(1);

    if (test.length === 0) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Verify all questions are approved and verified
    const questionIds = questionsToAdd.map((q) => q.questionId);
    const questionRecords = await db
      .select({
        id: questions.id,
        status: questions.status,
        isVerified: questions.isVerified,
      })
      .from(questions)
      .where(inArray(questions.id, questionIds));

    const unapprovedQuestions = questionRecords.filter(
      (q) => q.status !== 'approved' || !q.isVerified
    );

    if (unapprovedQuestions.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot add unapproved questions to test',
          unapprovedQuestionIds: unapprovedQuestions.map((q) => q.id),
        },
        { status: 400 }
      );
    }

    // Get current max order
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${testQuestions.questionOrder}), 0)::int` })
      .from(testQuestions)
      .where(eq(testQuestions.testId, testId));

    let currentOrder = maxOrderResult[0]?.maxOrder || 0;

    // Prepare insert data
    const insertData = questionsToAdd.map((q) => ({
      testId,
      questionId: q.questionId,
      questionOrder: ++currentOrder,
      marks: q.marks,
      sectionId: q.sectionId || null,
    }));

    // Insert questions
    const inserted = await db
      .insert(testQuestions)
      .values(insertData)
      .returning();

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
      message: `Successfully added ${inserted.length} question(s) to test`,
      addedQuestions: inserted,
      totalQuestions,
      totalMarks,
    });
  } catch (error: any) {
    console.error('Error adding questions to test:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    // Handle unique constraint violation (duplicate question in test)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'One or more questions are already in this test' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to add questions to test' },
      { status: error.status || 500 }
    );
  }
}

/**
 * PATCH /api/admin/tests/[id]/questions/reorder
 * Reorder questions in a test
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: testId } = await params;

    const body = await request.json();
    const { questionOrders } = reorderQuestionsSchema.parse(body);

    // Verify test exists
    const test = await db
      .select()
      .from(tests)
      .where(eq(tests.id, testId))
      .limit(1);

    if (test.length === 0) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Update each question's order
    for (const { id, questionOrder } of questionOrders) {
      await db
        .update(testQuestions)
        .set({ questionOrder })
        .where(
          and(
            eq(testQuestions.id, id),
            eq(testQuestions.testId, testId)
          )
        );
    }

    // Update test's updated_at
    await db
      .update(tests)
      .set({ updatedAt: new Date() })
      .where(eq(tests.id, testId));

    return NextResponse.json({
      message: 'Questions reordered successfully',
    });
  } catch (error: any) {
    console.error('Error reordering questions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to reorder questions' },
      { status: error.status || 500 }
    );
  }
}
