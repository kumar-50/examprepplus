import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server'
import { db } from '@/db'
import { questions } from '@/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { z } from 'zod'

const createQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  option1: z.string().min(1, 'Option 1 is required'),
  option2: z.string().min(1, 'Option 2 is required'),
  option3: z.string().min(1, 'Option 3 is required'),
  option4: z.string().min(1, 'Option 4 is required'),
  correctOption: z.number().int().min(1).max(4, 'Correct option must be between 1 and 4'),
  explanation: z.string().optional().nullable(),
  sectionId: z.string().uuid('Invalid section ID'),
  topicId: z.string().uuid('Invalid topic ID').optional().nullable(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).default('medium'),
  hasEquation: z.boolean().default(false),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
})

// GET /api/admin/questions - List questions with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sectionId = searchParams.get('sectionId')
    const topicId = searchParams.get('topicId')
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null
    const isActive = searchParams.get('isActive')

    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = []
    if (sectionId) conditions.push(eq(questions.sectionId, sectionId))
    if (topicId) conditions.push(eq(questions.topicId, topicId))
    if (difficulty) conditions.push(eq(questions.difficultyLevel, difficulty))
    if (isActive !== null) conditions.push(eq(questions.isActive, isActive === 'true'))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(whereClause)

    const total = Number(countResult[0]?.count || 0)

    // Get paginated results
    let query = db.select().from(questions)

    if (whereClause) {
      query = query.where(whereClause) as typeof query
    }

    const questionsList = await query
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      questions: questionsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/admin/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAdmin()

    const body = await request.json()
    const validated = createQuestionSchema.parse(body)

    const [newQuestion] = await db
      .insert(questions)
      .values({
        ...validated,
        createdBy: user.id,
      })
      .returning()

    return NextResponse.json({ question: newQuestion }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
