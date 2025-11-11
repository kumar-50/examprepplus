import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const testSignup = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

  console.log('🧪 Testing signup flow...\n')

  try {
    const testId = '99999999-9999-9999-9999-999999999999'
    const testEmail = 'trigger-test@example.com'

    // Simulate what the trigger does
    console.log('Testing INSERT into public.users...\n')
    
    await sql`
      INSERT INTO public.users (
        id, 
        email, 
        full_name,
        role,
        subscription_status,
        is_active,
        created_at, 
        updated_at
      )
      VALUES (
        ${testId},
        ${testEmail},
        'Test User',
        'user',
        'free',
        true,
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now()
    `

    console.log('✅ INSERT succeeded!')

    // Clean up
    await sql`DELETE FROM public.users WHERE id = ${testId}`
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 Trigger should work! Try signing up again.')

  } catch (error: any) {
    console.error('❌ INSERT failed:', error.message)
    console.error('\nFull error:', error)
  } finally {
    await sql.end()
  }
}

testSignup()
