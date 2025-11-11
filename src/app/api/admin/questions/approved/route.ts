import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { questions, sections, topics } from '@/db/schema';
import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';

/**
 * GET /api/admin/questions/approved
 * Get all approved and verified questions for test builder
 * Only returns questions that are approved, verified, and active
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sectionId = searchParams.get('sectionId');
    const topicId = searchParams.get('topicId');
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build where conditions - CRITICAL: only approved and verified questions
    const conditions = [
      eq(questions.status, 'approved'),
      eq(questions.isVerified, true),
      eq(questions.isActive, true),
    ];

    if (sectionId) conditions.push(eq(questions.sectionId, sectionId));
    if (topicId) conditions.push(eq(questions.topicId, topicId));
    if (difficulty) conditions.push(eq(questions.difficultyLevel, difficulty));

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get questions with section and topic details
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
        sectionName: sections.name,
        topicId: questions.topicId,
        topicName: topics.name,
        difficultyLevel: questions.difficultyLevel,
        hasEquation: questions.hasEquation,
        imageUrl: questions.imageUrl,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .leftJoin(sections, eq(questions.sectionId, sections.id))
      .leftJoin(topics, eq(questions.topicId, topics.id))
      .where(whereClause)
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset);

    // Get stats by section for the picker
    const statsBySection = await db
      .select({
        sectionId: questions.sectionId,
        sectionName: sections.name,
        count: sql<number>`count(*)::int`,
      })
      .from(questions)
      .leftJoin(sections, eq(questions.sectionId, sections.id))
      .where(
        and(
          eq(questions.status, 'approved'),
          eq(questions.isVerified, true),
          eq(questions.isActive, true)
        )
      )
      .groupBy(questions.sectionId, sections.name);

    return NextResponse.json({
      questions: questionsList,
      stats: {
        total,
        bySection: statsBySection,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching approved questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch approved questions' },
      { status: error.status || 500 }
    );
  }
}
