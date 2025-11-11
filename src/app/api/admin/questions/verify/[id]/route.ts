import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { questions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const verifyQuestionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

/**
 * PATCH /api/admin/questions/verify/[id]
 * Approve or reject a single question
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { action, rejectionReason } = verifyQuestionSchema.parse(body);

    // Check if question exists
    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (question.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
      verifiedBy: user.id,
      verifiedAt: new Date(),
    };

    if (action === 'approve') {
      updateData.status = 'approved';
      updateData.isVerified = true;
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.isVerified = false;
      // Note: rejectionReason could be stored if we add a column for it
    }

    const updated = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, id))
      .returning();

    return NextResponse.json({
      message: `Question ${action}ed successfully`,
      question: updated[0],
    });
  } catch (error: any) {
    console.error('Error verifying question:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to verify question' },
      { status: error.status || 500 }
    );
  }
}
