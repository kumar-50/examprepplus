/**
 * Sync existing auth users to public.users table
 * This handles users created before the trigger was set up
 */

import { db } from '@/db'
import { users } from '@/db/schema/users'
import { getSupabaseServerClient } from '@/lib/supabase/server'

async function syncAuthUsers() {
  try {
    console.log('🔄 Syncing auth.users to public.users...\n')
    
    const supabase = await getSupabaseServerClient()
    
    // Get all users from auth.users via Supabase Admin API
    const { data: authUsers, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Error fetching auth users:', error)
      process.exit(1)
    }
    
    if (!authUsers || authUsers.users.length === 0) {
      console.log('ℹ️  No users found in auth.users')
      process.exit(0)
    }
    
    console.log(`Found ${authUsers.users.length} users in auth.users\n`)
    
    let synced = 0
    let skipped = 0
    
    for (const authUser of authUsers.users) {
      try {
        // Check if user already exists in public.users
        const existingUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, authUser.id)
        })
        
        if (existingUser) {
          console.log(`⏭️  ${authUser.email} - already exists`)
          skipped++
          continue
        }
        
        // Insert user into public.users
        await db.insert(users).values({
          id: authUser.id,
          email: authUser.email!,
          fullName: authUser.user_metadata?.full_name || null,
          role: 'user',
          subscriptionStatus: 'free',
          isActive: true,
          createdAt: new Date(authUser.created_at),
          updatedAt: new Date(),
        })
        
        console.log(`✅ ${authUser.email} - synced successfully`)
        synced++
        
      } catch (err) {
        console.error(`❌ ${authUser.email} - error:`, err)
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   Synced: ${synced}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Total: ${authUsers.users.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

syncAuthUsers()
