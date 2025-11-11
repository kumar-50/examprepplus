import { getSupabaseServerClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'

/**
 * Get the current authenticated user from Supabase auth
 */
export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get user profile from database including role
 */
export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return profile
}

/**
 * Check if current user is an admin
 */
export async function isAdmin() {
  const user = await getCurrentUser()
  if (!user) return false

  const profile = await getUserProfile(user.id)
  return profile?.role === 'admin'
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  console.log('🔐 requireAuth called')
  const user = await getCurrentUser()
  console.log('🔐 requireAuth user:', user ? `${user.id} (${user.email})` : 'null')
  if (!user) {
    console.log('❌ requireAuth: No user, throwing error')
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)
  
  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return { user, profile }
}
