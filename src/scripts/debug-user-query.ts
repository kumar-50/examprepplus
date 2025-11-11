/**
 * Debug database query to find user
 */

import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'

const userId = '014dbbc4-ab8f-4a2a-958e-544a02ca28ee'
const email = 'muthu08612@gmail.com'

async function debugUser() {
  try {
    console.log('🔍 Searching for user...')
    console.log('   By ID:', userId)
    console.log('   By Email:', email)
    
    // Try by ID
    const [userById] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    console.log('\n📍 Query by ID result:', userById || 'NOT FOUND')
    
    // Try by email
    const [userByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    
    console.log('\n📍 Query by email result:', userByEmail || 'NOT FOUND')
    
    // List all users
    const allUsers = await db.select().from(users).limit(10)
    
    console.log('\n📋 All users in database:')
    allUsers.forEach(u => {
      console.log(`   - ${u.id} | ${u.email} | ${u.role}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

debugUser()
