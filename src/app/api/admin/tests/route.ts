import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { db } from '@/db';
import { tests, testQuestions } from '@/db/schema';
import { eq, desc, sql, and, ilike, inArray } from 'drizzle-orm';
import { z } from 'zod';

const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  testType: z.enum(['mock', 'live', 'sectional', 'practice']),
  totalQuestions: z.number().int().min(1, 'Must have at least 1 question'),
  totalMarks: z.number().int().min(1, 'Total marks must be at least 1'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  negativeMarking: z.boolean().default(false),
  negativeMarkingValue: z.number().int().optional().default(0),
  isPublished: z.boolean().default(false),
  isFree: z.boolean().default(false),
  instructions: z.string().optional().nullable(),
  testPattern: z.record(z.string(), z.number()).optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
});

const updateTestSchema = createTestSchema.partial();

/**
 * GET /api/admin/tests
 * List all tests with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const testType = searchParams.get('testType') as 'mock' | 'live' | 'sectional' | 'practice' | null;
    const isPublished = searchParams.get('isPublished');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (testType) conditions.push(eq(tests.testType, testType));
    if (isPublished !== null && isPublished !== undefined) {
      conditions.push(eq(tests.isPublished, isPublished === 'true'));
    }
    if (search) {
      conditions.push(ilike(tests.title, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tests)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get tests
    const testsList = await db
      .select()
      .from(tests)
      .where(whereClause)
      .orderBy(desc(tests.createdAt))
      .limit(limit)
      .offset(offset);

    // Get question counts for each test
    const testIds = testsList.map((t) => t.id);
    
    let questionCounts: { testId: string; count: number }[] = [];
    if (testIds.length > 0) {
      const counts = await db
        .select({
          testId: testQuestions.testId,
          count: sql<number>`count(*)::int`,
        })
        .from(testQuestions)
        .where(inArray(testQuestions.testId, testIds))
        .groupBy(testQuestions.testId);
      
      questionCounts = counts.map((c) => ({
        testId: c.testId,
        count: c.count,
      }));
    }

    const questionCountMap = new Map(questionCounts.map((qc) => [qc.testId, qc.count]));

    // Enhance tests with question counts
    const enhancedTests = testsList.map((test) => ({
      ...test,
      questionCount: questionCountMap.get(test.id) || 0,
    }));

    return NextResponse.json({
      tests: enhancedTests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tests' },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/admin/tests
 * Create a new test
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const validatedData = createTestSchema.parse(body);

    const newTest = await db
      .insert(tests)
      .values({
        ...validatedData,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { message: 'Test created successfully', test: newTest[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating test:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create test' },
      { status: error.status || 500 }
    );
  }
}
