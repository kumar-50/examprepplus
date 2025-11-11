import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { questions, sections } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const importQuestionSchema = z.object({
  questionText: z.string().min(1),
  option1: z.string().min(1),
  option2: z.string().min(1),
  option3: z.string().min(1),
  option4: z.string().min(1),
  correctOption: z.number().int().min(1).max(4),
  sectionName: z.string().min(1),
  year: z.string().optional(),
});

const bulkImportSchema = z.object({
  questions: z.array(importQuestionSchema),
});

interface SectionMapping {
  [sectionName: string]: string; // section name -> section id
}

/**
 * POST /api/admin/questions/import-csv
 * Bulk import questions from CSV
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAdmin();

    const body = await request.json();
    const validated = bulkImportSchema.parse(body);

    if (validated.questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions to import' },
        { status: 400 }
      );
    }

    // Get all unique section names from the import data
    const uniqueSectionNames = [
      ...new Set(validated.questions.map((q) => q.sectionName)),
    ];

    // Fetch existing sections
    const existingSections = await db
      .select()
      .from(sections)
      .where(
        sql`LOWER(${sections.name}) IN (${sql.join(
          uniqueSectionNames.map((name) => sql`LOWER(${name})`),
          sql`, `
        )})`
      );

    // Create a mapping of section names to IDs (case-insensitive)
    const sectionMapping: SectionMapping = {};
    existingSections.forEach((section) => {
      sectionMapping[section.name.toLowerCase()] = section.id;
    });

    // Find sections that don't exist
    const missingSections = uniqueSectionNames.filter(
      (name) => !sectionMapping[name.toLowerCase()]
    );

    // Auto-create missing sections
    if (missingSections.length > 0) {
      const maxOrderResult = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${sections.displayOrder}), 0)` })
        .from(sections);
      
      let nextOrder = Number(maxOrderResult[0]?.maxOrder || 0) + 1;

      for (const sectionName of missingSections) {
        const [newSection] = await db
          .insert(sections)
          .values({
            name: sectionName,
            displayOrder: nextOrder++,
            examType: 'RRB_NTPC', // Default exam type
          })
          .returning();

        if (newSection) {
          sectionMapping[sectionName.toLowerCase()] = newSection.id;
        }
      }
    }

    // Prepare questions for bulk insert
    const questionsToInsert = validated.questions.map((q) => {
      const sectionId = sectionMapping[q.sectionName.toLowerCase()];
      if (!sectionId) {
        throw new Error(`Section not found: ${q.sectionName}`);
      }
      
      return {
        questionText: q.questionText,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correctOption: q.correctOption,
        sectionId,
        difficultyLevel: 'medium' as const,
        hasEquation: false,
        isActive: true,
        createdBy: user.id,
      };
    });

    // Bulk insert in a transaction
    const result = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(questions)
        .values(questionsToInsert)
        .returning({ id: questions.id });

      return inserted;
    });

    return NextResponse.json({
      success: true,
      imported: result.length,
      sectionsCreated: missingSections.length,
      message: `Successfully imported ${result.length} questions${
        missingSections.length > 0
          ? ` and created ${missingSections.length} new section(s)`
          : ''
      }`,
    });
  } catch (error) {
    console.error('Error importing questions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to import questions' },
      { status: 500 }
    );
  }
}
