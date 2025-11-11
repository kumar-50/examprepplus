/**
 * Test if user exists and check their role
 * Usage: npx dotenv -e .env.local -- tsx src/scripts/test-login.ts <email>
 */

import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'

const emailArg = process.argv[2]

if (!emailArg) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx dotenv -e .env.local -- tsx src/scripts/test-login.ts <email>')
  process.exit(1)
}

const email: string = emailArg

async function testLogin() {
  try {
    console.log(`🔍 Looking for user: ${email}`)
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      console.error(`❌ User not found in public.users table`)
      console.log('\n💡 This user might exist in auth.users but not synced to public.users')
      console.log('   Run this SQL in Supabase to manually add them:')
      console.log(`   
   INSERT INTO public.users (id, email, role, subscription_status, is_active, created_at, updated_at)
   SELECT id, email, 'user', 'free', true, NOW(), NOW()
   FROM auth.users
   WHERE email = '${email}'
   ON CONFLICT (id) DO NOTHING;
   `)
      process.exit(1)
    }

    console.log('✅ User found!')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.fullName || '(not set)'}`)
    console.log(`   Role: ${user.role} ${user.role === 'admin' ? '👑' : '👤'}`)
    console.log(`   Subscription: ${user.subscriptionStatus}`)
    console.log(`   Active: ${user.isActive ? 'Yes ✅' : 'No ❌'}`)
    console.log(`   Created: ${user.createdAt}`)
    
    console.log('\n📍 Login redirect:')
    if (user.role === 'admin') {
      console.log('   → /admin (Admin Dashboard)')
    } else {
      console.log('   → /dashboard (User Dashboard)')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

testLogin()
