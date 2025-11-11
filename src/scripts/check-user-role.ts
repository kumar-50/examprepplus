import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'

async function checkUserRole() {
  const email = 'muthu09612@gmail.com'
  const userId = '8dfbad7a-7b60-4d56-981f-c742666b8a63'

  console.log('🔍 Checking user role...')
  console.log('Email:', email)
  console.log('User ID:', userId)
  console.log('---')

  // Check by email
  const [userByEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  console.log('User by email:', userByEmail)
  console.log('---')

  // Check by ID
  const [userById] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  console.log('User by ID:', userById)
  console.log('---')

  if (userById && userById.role !== 'admin') {
    console.log('⚠️  User is not admin, updating...')
    await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, userId))

    console.log('✅ User updated to admin')
    
    // Verify
    const [updated] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    console.log('Updated user:', updated)
  } else if (userById) {
    console.log('✅ User is already admin')
  } else {
    console.log('❌ User not found in database')
  }
}

checkUserRole()
  .then(() => {
    console.log('✅ Done')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
