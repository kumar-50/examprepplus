import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { users, userTestAttempts, userGoals } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const deleteSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.string().refine((val) => val === 'DELETE', {
    message: 'You must type DELETE to confirm',
  }),
})

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = deleteSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Verify password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validated.password,
    })

    if (verifyError) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      )
    }

    // Delete all user data from database (cascade will delete related records)
    await db.delete(userGoals).where(eq(userGoals.userId, user.id))
    await db.delete(userTestAttempts).where(eq(userTestAttempts.userId, user.id))
    await db.delete(users).where(eq(users.id, user.id))

    // Delete avatar from storage if exists
    const avatarUrl = user.user_metadata?.avatar_url
    if (avatarUrl) {
      const path = avatarUrl.split('/').pop()
      if (path) {
        await supabase.storage.from('avatars').remove([`${user.id}/${path}`])
      }
    }

    // Delete Supabase auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      // Continue anyway as database records are already deleted
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
