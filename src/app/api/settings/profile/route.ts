import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  target_exam: z.string().max(100).optional().nullable(),
  exam_date: z.string().optional().nullable(),
  exam_center: z.string().max(200).optional().nullable(),
})

// GET - Get user profile
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.fullName,
      avatar_url: user.user_metadata?.avatar_url || null,
      phone: user.user_metadata?.phone || null,
      target_exam: user.user_metadata?.target_exam || null,
      exam_date: user.user_metadata?.exam_date || null,
      exam_center: user.user_metadata?.exam_center || null,
      email_verified: !!user.email_confirmed_at,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = profileSchema.parse(body)

    // Update database name
    if (validated.name) {
      await db
        .update(users)
        .set({ fullName: validated.name })
        .where(eq(users.id, user.id))
    }

    // Update Supabase user metadata for other fields
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.updateUser({
      data: {
        phone: validated.phone,
        target_exam: validated.target_exam,
        exam_date: validated.exam_date,
        exam_center: validated.exam_center,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
