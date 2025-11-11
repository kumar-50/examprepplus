import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server'
import { db } from '@/db'
import { questions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required').optional(),
  option1: z.string().min(1, 'Option 1 is required').optional(),
  option2: z.string().min(1, 'Option 2 is required').optional(),
  option3: z.string().min(1, 'Option 3 is required').optional(),
  option4: z.string().min(1, 'Option 4 is required').optional(),
  correctOption: z.number().int().min(1).max(4).optional(),
  explanation: z.string().optional().nullable(),
  sectionId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional().nullable(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  hasEquation: z.boolean().optional(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/questions/[id] - Get a single question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1)

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/questions/[id] - Update a question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const validated = updateQuestionSchema.parse(body)

    const [updatedQuestion] = await db
      .update(questions)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id))
      .returning()

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ question: updatedQuestion })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/questions/[id] - Delete a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const [deletedQuestion] = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning()

    if (!deletedQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
