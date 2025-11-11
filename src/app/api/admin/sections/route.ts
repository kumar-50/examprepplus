import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server'
import { db } from '@/db'
import { sections } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { z } from 'zod'

const createSectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  displayOrder: z.number().int().default(0),
  examType: z.enum(['RRB_NTPC', 'SSC_CGL', 'BANK_PO', 'OTHER']).default('RRB_NTPC'),
})

// GET /api/admin/sections - List all sections
export async function GET() {
  try {
    await requireAdmin()

    const allSections = await db
      .select()
      .from(sections)
      .orderBy(desc(sections.displayOrder), desc(sections.createdAt))

    return NextResponse.json({ sections: allSections })
  } catch (error) {
    console.error('Error fetching sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}

// POST /api/admin/sections - Create a new section
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validated = createSectionSchema.parse(body)

    const [newSection] = await db
      .insert(sections)
      .values(validated)
      .returning()

    return NextResponse.json({ section: newSection }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating section:', error)
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    )
  }
}
