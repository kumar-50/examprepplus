import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { tests, testQuestions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const updateTestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  testType: z.enum(['mock', 'live', 'sectional', 'practice']).optional(),
  totalQuestions: z.number().int().min(1).optional(),
  totalMarks: z.number().int().min(1).optional(),
  duration: z.number().int().min(1).optional(),
  negativeMarking: z.boolean().optional(),
  negativeMarkingValue: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  isFree: z.boolean().optional(),
  instructions: z.string().optional().nullable(),
  testPattern: z.record(z.string(), z.number()).optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
});

/**
 * GET /api/admin/tests/[id]
 * Get a single test with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const test = await db
      .select()
      .from(tests)
      .where(eq(tests.id, id))
      .limit(1);

    if (test.length === 0) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Get question count
    const questionCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(testQuestions)
      .where(eq(testQuestions.testId, id));

    return NextResponse.json({
      ...test[0],
      questionCount: questionCount[0]?.count || 0,
    });
  } catch (error: any) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch test' },
      { status: error.status || 500 }
    );
  }
}

/**
 * PATCH /api/admin/tests/[id]
 * Update a test
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const body = await request.json();
    const validatedData = updateTestSchema.parse(body);

    // Check if test exists
    const existingTest = await db
      .select()
      .from(tests)
      .where(eq(tests.id, id))
      .limit(1);

    if (existingTest.length === 0) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (validatedData.scheduledAt !== undefined) {
      updateData.scheduledAt = validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null;
    }

    const updated = await db
      .update(tests)
      .set(updateData)
      .where(eq(tests.id, id))
      .returning();

    return NextResponse.json({
      message: 'Test updated successfully',
      test: updated[0],
    });
  } catch (error: any) {
    console.error('Error updating test:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update test' },
      { status: error.status || 500 }
    );
  }
}

/**
 * DELETE /api/admin/tests/[id]
 * Delete a test (cascade deletes test questions)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    // Check if test exists
    const existingTest = await db
      .select()
      .from(tests)
      .where(eq(tests.id, id))
      .limit(1);

    if (existingTest.length === 0) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Delete test (testQuestions will be cascade deleted)
    await db
      .delete(tests)
      .where(eq(tests.id, id));

    return NextResponse.json({
      message: 'Test deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete test' },
      { status: error.status || 500 }
    );
  }
}
