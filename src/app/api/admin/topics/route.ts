import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server'
import { db } from '@/db'
import { topics } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const createTopicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sectionId: z.string().uuid('Invalid section ID'),
  description: z.string().optional(),
})

// GET /api/admin/topics - List all topics (optionally filtered by section)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const sectionId = searchParams.get('sectionId')

    let query = db.select().from(topics)

    if (sectionId) {
      query = query.where(eq(topics.sectionId, sectionId)) as typeof query
    }

    const allTopics = await query.orderBy(desc(topics.createdAt))

    return NextResponse.json({ topics: allTopics })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

// POST /api/admin/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validated = createTopicSchema.parse(body)

    const [newTopic] = await db
      .insert(topics)
      .values(validated)
      .returning()

    return NextResponse.json({ topic: newTopic }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating topic:', error)
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
