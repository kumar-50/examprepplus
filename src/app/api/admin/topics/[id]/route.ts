import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server'
import { db } from '@/db'
import { topics } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateTopicSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  sectionId: z.string().uuid('Invalid section ID').optional(),
  description: z.string().optional(),
})

// GET /api/admin/topics/[id] - Get a single topic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.id, id))
      .limit(1)

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ topic })
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/topics/[id] - Update a topic
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const validated = updateTopicSchema.parse(body)

    const [updatedTopic] = await db
      .update(topics)
      .set(validated)
      .where(eq(topics.id, id))
      .returning()

    if (!updatedTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ topic: updatedTopic })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating topic:', error)
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/topics/[id] - Delete a topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const [deletedTopic] = await db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning()

    if (!deletedTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    )
  }
}
