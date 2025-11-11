import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const checkSchema = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

  console.log('🔍 Checking public.users table...\n')

  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists
    `
    
    console.log('Table exists:', tableExists[0].exists)

    if (tableExists[0].exists) {
      // Check columns
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'users'
        ORDER BY ordinal_position
      `

      console.log('\n📋 Columns in public.users:\n')
      columns.forEach(col => {
        console.log(`  ${col.column_name}`)
        console.log(`    Type: ${col.data_type}`)
        console.log(`    Nullable: ${col.is_nullable}`)
        console.log(`    Default: ${col.column_default || '(none)'}`)
        console.log()
      })

      // Check constraints
      const constraints = await sql`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `

      console.log('📌 Constraints:\n')
      constraints.forEach(c => {
        console.log(`  ${c.constraint_name}: ${c.constraint_type}`)
      })

      // Try a test insert
      console.log('\n🧪 Testing insert...\n')
      try {
        await sql`
          INSERT INTO public.users (id, email, created_at, updated_at)
          VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `
        console.log('✅ Test insert succeeded!')
        
        // Clean up
        await sql`DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001'`
      } catch (error: any) {
        console.log('❌ Test insert failed:', error.message)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sql.end()
  }
}

checkSchema()
