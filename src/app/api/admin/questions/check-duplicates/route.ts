import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { questions, sections } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const checkQuestionSchema = z.object({
  questionText: z.string(),
  sectionName: z.string(),
  rowNumber: z.number(),
});

const checkDuplicatesSchema = z.object({
  questions: z.array(checkQuestionSchema),
});

/**
 * POST /api/admin/questions/check-duplicates
 * Check for duplicate questions before import
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = checkDuplicatesSchema.parse(body);

    if (validated.questions.length === 0) {
      return NextResponse.json({ duplicates: [] });
    }

    // Get all unique section names
    const uniqueSectionNames = [
      ...new Set(validated.questions.map((q) => q.sectionName)),
    ];

    // Fetch existing sections to get their IDs
    const existingSections = await db
      .select()
      .from(sections)
      .where(
        sql`LOWER(${sections.name}) IN (${sql.join(
          uniqueSectionNames.map((name) => sql`LOWER(${name})`),
          sql`, `
        )})`
      );

    // Create section name to ID mapping
    const sectionMapping: { [key: string]: string } = {};
    existingSections.forEach((section) => {
      sectionMapping[section.name.toLowerCase()] = section.id;
    });

    // Check each question for duplicates
    const duplicates: Array<{
      rowNumber: number;
      questionText: string;
      sectionName: string;
      existingQuestionId: string;
    }> = [];

    for (const question of validated.questions) {
      const sectionId = sectionMapping[question.sectionName.toLowerCase()];
      
      // If section doesn't exist, it can't be a duplicate
      if (!sectionId) {
        continue;
      }

      // Check for existing question with same text in same section
      const existingQuestion = await db
        .select({ id: questions.id })
        .from(questions)
        .where(
          and(
            eq(questions.sectionId, sectionId),
            sql`LOWER(TRIM(${questions.questionText})) = LOWER(TRIM(${question.questionText}))`
          )
        )
        .limit(1);

      if (existingQuestion.length > 0) {
        duplicates.push({
          rowNumber: question.rowNumber,
          questionText: question.questionText,
          sectionName: question.sectionName,
          existingQuestionId: existingQuestion[0].id,
        });
      }
    }

    return NextResponse.json({
      duplicates,
      total: validated.questions.length,
      duplicateCount: duplicates.length,
    });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check duplicates' },
      { status: 500 }
    );
  }
}
