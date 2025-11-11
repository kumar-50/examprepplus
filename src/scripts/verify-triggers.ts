import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const verify = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

  console.log('🔍 Checking triggers...\n')

  try {
    const triggers = await sql`
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_name IN ('on_auth_user_created', 'on_user_login')
      ORDER BY trigger_name
    `

    if (triggers.length === 0) {
      console.log('❌ No triggers found!')
      console.log('Run: npm run migrate')
    } else {
      console.log('✅ Triggers installed:\n')
      triggers.forEach(t => {
        console.log(`  ${t.trigger_name}`)
        console.log(`    → ${t.action_timing} ${t.event_manipulation} on ${t.event_object_table}`)
      })
      console.log('\n✅ Auth sync is active!')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sql.end()
  }
}

verify()
