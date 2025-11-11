import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { questions, testQuestions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface SectionPattern {
  sectionId: string;
  count: number;
}

// POST /api/admin/tests/[id]/generate-questions
// Randomly select questions based on section patterns
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: testId } = await params;
    const body = await request.json();
    const { sectionPatterns } = body as { sectionPatterns: SectionPattern[] };

    if (!Array.isArray(sectionPatterns) || sectionPatterns.length === 0) {
      return NextResponse.json(
        { error: 'Section patterns are required' },
        { status: 400 }
      );
    }

    // Delete existing test questions
    await db.delete(testQuestions).where(eq(testQuestions.testId, testId));

    const selectedQuestions: Array<{ id: string; questionOrder: number; sectionId: string }> = [];
    let questionOrder = 1;

    // For each section pattern, randomly select approved questions
    for (const pattern of sectionPatterns) {
      // Get random approved questions from this section
      const randomQuestions = await db
        .select({ id: questions.id })
        .from(questions)
        .where(
          and(
            eq(questions.sectionId, pattern.sectionId),
            eq(questions.status, 'approved'),
            eq(questions.isVerified, true),
            eq(questions.isActive, true)
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(pattern.count);

      if (randomQuestions.length < pattern.count) {
        return NextResponse.json(
          { 
            error: `Not enough approved questions in section. Requested: ${pattern.count}, Available: ${randomQuestions.length}` 
          },
          { status: 400 }
        );
      }

      // Add to selected questions with order and section
      randomQuestions.forEach((q) => {
        selectedQuestions.push({
          id: q.id,
          questionOrder: questionOrder++,
          sectionId: pattern.sectionId,
        });
      });
    }

    // Insert all selected questions into test_questions
    await db.insert(testQuestions).values(
      selectedQuestions.map((q) => ({
        testId,
        questionId: q.id,
        questionOrder: q.questionOrder,
        marks: 1, // Default 1 mark per question
        sectionId: q.sectionId, // Save section ID
      }))
    );

    return NextResponse.json({
      message: 'Questions generated successfully',
      totalQuestions: selectedQuestions.length,
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
