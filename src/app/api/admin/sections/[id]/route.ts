import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server'
import { db } from '@/db'
import { sections } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateSectionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
  examType: z.enum(['RRB_NTPC', 'SSC_CGL', 'BANK_PO', 'OTHER']).optional(),
})

// GET /api/admin/sections/[id] - Get a single section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const [section] = await db
      .select()
      .from(sections)
      .where(eq(sections.id, id))
      .limit(1)

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ section })
  } catch (error) {
    console.error('Error fetching section:', error)
    return NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/sections/[id] - Update a section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const validated = updateSectionSchema.parse(body)

    const [updatedSection] = await db
      .update(sections)
      .set(validated)
      .where(eq(sections.id, id))
      .returning()

    if (!updatedSection) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ section: updatedSection })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating section:', error)
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/sections/[id] - Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const [deletedSection] = await db
      .delete(sections)
      .where(eq(sections.id, id))
      .returning()

    if (!deletedSection) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting section:', error)
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    )
  }
}
