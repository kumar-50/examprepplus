/**
 * Manually insert a user into public.users table
 * Usage: npx dotenv -e .env.local -- tsx src/scripts/insert-user.ts <user-id> <email> <name>
 */

import { db } from '@/db'
import { users } from '@/db/schema/users'

const userId = process.argv[2]
const email = process.argv[3]
const fullName = process.argv[4] || null

if (!userId || !email) {
  console.error('❌ Missing required arguments')
  console.log('Usage: npx dotenv -e .env.local -- tsx src/scripts/insert-user.ts <user-id> <email> <name>')
  console.log('\nExample:')
  console.log('  npx dotenv -e .env.local -- tsx src/scripts/insert-user.ts "014dbbc4-ab8f-4a2a-958e-544a02ca28ee" "muthu08612@gmail.com" "admin"')
  process.exit(1)
}

async function insertUser() {
  try {
    console.log('📝 Inserting user into public.users...')
    console.log(`   ID: ${userId}`)
    console.log(`   Email: ${email}`)
    console.log(`   Name: ${fullName || '(not set)'}`)
    
    await db.insert(users).values({
      id: userId,
      email: email,
      fullName: fullName,
      role: 'user',
      subscriptionStatus: 'free',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        email: email,
        fullName: fullName,
        updatedAt: new Date(),
      }
    })
    
    console.log('✅ User inserted successfully!')
    console.log('\n💡 To make this user an admin, run:')
    console.log(`   npm run make-admin ${email}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

insertUser()
