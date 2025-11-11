/**
 * Script to promote a user to admin role
 * Usage: npx dotenv -e .env.local -- tsx src/scripts/make-user-admin.ts <email>
 */

import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'

const emailArg = process.argv[2]

if (!emailArg) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx dotenv -e .env.local -- tsx src/scripts/make-user-admin.ts <email>')
  process.exit(1)
}

const email: string = emailArg

async function makeUserAdmin() {
  try {
    console.log(`🔍 Looking for user: ${email}`)
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.fullName || 'No name'} (${user.email})`)
    console.log(`   Current role: ${user.role}`)

    if (user.role === 'admin') {
      console.log('ℹ️  User is already an admin!')
      process.exit(0)
    }

    // Update to admin
    await db
      .update(users)
      .set({ 
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))

    console.log('✅ User promoted to admin!')
    console.log(`   ${email} → role: admin`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

makeUserAdmin()
