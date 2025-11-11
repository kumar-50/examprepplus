import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const checkAuthSchema = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

  console.log('🔍 Checking auth.users table structure...\n')

  try {
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'auth' 
        AND table_name = 'users'
      ORDER BY ordinal_position
    `

    console.log('📋 Columns in auth.users:\n')
    columns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type})`)
    })

    // Check actual user data
    console.log('\n🔍 Checking your user data...\n')
    const user = await sql`
      SELECT *
      FROM auth.users
      WHERE email = 'muthu08612@gmail.com'
      LIMIT 1
    `

    if (user.length > 0) {
      console.log('User data:')
      console.log(JSON.stringify(user[0], null, 2))
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sql.end()
  }
}

checkAuthSchema()
