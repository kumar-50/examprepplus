import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const checkTrigger = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

  console.log('🔍 Checking trigger function...\n')

  try {
    const result = await sql`
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'handle_new_user'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `

    if (result.length > 0) {
      console.log('Current trigger function:\n')
      console.log(result[0].definition)
      
      if (result[0].definition.includes('role') && 
          result[0].definition.includes('subscription_status') && 
          result[0].definition.includes('is_active')) {
        console.log('\n✅ Trigger includes all required fields!')
      } else {
        console.log('\n❌ Trigger is MISSING required fields (role, subscription_status, is_active)')
        console.log('\n🔧 Run this SQL to fix:')
        console.log('See: migrations/fix-trigger.sql')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sql.end()
  }
}

checkTrigger()
