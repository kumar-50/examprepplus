import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { questions, users } from '@/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';

// Schema for approving/rejecting a question
const verifyQuestionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

// Schema for bulk verification
const bulkVerifySchema = z.object({
  questionIds: z.array(z.string().uuid()),
  action: z.enum(['approve', 'reject']),
});

/**
 * GET /api/admin/questions/verify
 * List questions with filters for verification status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    const sectionId = searchParams.get('sectionId');
    const topicId = searchParams.get('topicId');
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (status) conditions.push(eq(questions.status, status));
    if (sectionId) conditions.push(eq(questions.sectionId, sectionId));
    if (topicId) conditions.push(eq(questions.topicId, topicId));
    if (difficulty) conditions.push(eq(questions.difficultyLevel, difficulty));
    conditions.push(eq(questions.isActive, true)); // Only show active questions

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get questions with creator and verifier details
    const questionsList = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        option1: questions.option1,
        option2: questions.option2,
        option3: questions.option3,
        option4: questions.option4,
        correctOption: questions.correctOption,
        explanation: questions.explanation,
        sectionId: questions.sectionId,
        topicId: questions.topicId,
        difficultyLevel: questions.difficultyLevel,
        hasEquation: questions.hasEquation,
        imageUrl: questions.imageUrl,
        status: questions.status,
        isVerified: questions.isVerified,
        verifiedBy: questions.verifiedBy,
        verifiedAt: questions.verifiedAt,
        createdBy: questions.createdBy,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        creatorName: users.fullName,
      })
      .from(questions)
      .leftJoin(users, eq(questions.createdBy, users.id))
      .where(whereClause)
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset);

    // Get verifier names for questions that have been verified
    const verifierIds = questionsList
      .map((q) => q.verifiedBy)
      .filter((id): id is string => id !== null);

    const verifiers = verifierIds.length > 0
      ? await db
          .select({ id: users.id, fullName: users.fullName })
          .from(users)
          .where(inArray(users.id, verifierIds))
      : [];

    const verifierMap = new Map(verifiers.map((v) => [v.id, v.fullName]));

    // Enhance questions with verifier names
    const enhancedQuestions = questionsList.map((q) => ({
      ...q,
      verifierName: q.verifiedBy ? verifierMap.get(q.verifiedBy) : null,
    }));

    return NextResponse.json({
      questions: enhancedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching questions for verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/admin/questions/verify/bulk
 * Bulk approve or reject multiple questions
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAdmin();

    const body = await request.json();
    const { questionIds, action } = bulkVerifySchema.parse(body);

    if (questionIds.length === 0) {
      return NextResponse.json(
        { error: 'No questions selected' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (action === 'approve') {
      updateData.status = 'approved';
      updateData.isVerified = true;
      updateData.verifiedBy = user.id;
      updateData.verifiedAt = new Date();
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.isVerified = false;
      updateData.verifiedBy = user.id;
      updateData.verifiedAt = new Date();
    }

    await db
      .update(questions)
      .set(updateData)
      .where(inArray(questions.id, questionIds));

    return NextResponse.json({
      message: `Successfully ${action}ed ${questionIds.length} question(s)`,
      count: questionIds.length,
    });
  } catch (error: any) {
    console.error('Error bulk verifying questions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to verify questions' },
      { status: error.status || 500 }
    );
  }
}
