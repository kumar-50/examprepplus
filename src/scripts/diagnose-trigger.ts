import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const diagnoseTrigger = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

  console.log('🔍 Comprehensive Trigger Diagnosis\n')

  try {
    // 1. Check if trigger exists
    console.log('1️⃣ Checking if trigger exists...')
    const trigger = await sql`
      SELECT trigger_name, event_object_table, action_statement
      FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    `
    
    if (trigger.length === 0) {
      console.log('❌ Trigger does NOT exist!')
      console.log('Run: npm run migrate')
      return
    }
    
    console.log('✅ Trigger exists on table:', trigger[0].event_object_table)

    // 2. Check function permissions
    console.log('\n2️⃣ Checking function permissions...')
    const funcInfo = await sql`
      SELECT 
        proname,
        prosecdef,
        proconfig
      FROM pg_proc
      WHERE proname = 'handle_new_user'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `
    
    console.log('Security Definer:', funcInfo[0].prosecdef)
    console.log('Config:', funcInfo[0].proconfig)

    // 3. Test the function directly
    console.log('\n3️⃣ Testing function directly with sample data...')
    
    const testAuthUser = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'direct-test@example.com',
      raw_user_meta_data: { full_name: 'Direct Test' }
    }

    try {
      // Simulate trigger by calling function logic directly
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
          ${testAuthUser.id},
          ${testAuthUser.email},
          ${testAuthUser.raw_user_meta_data.full_name},
          'user',
          'free',
          true,
          now(),
          now()
        )
        ON CONFLICT (id) DO NOTHING
      `
      console.log('✅ Direct function logic works!')
      
      // Cleanup
      await sql`DELETE FROM public.users WHERE id = ${testAuthUser.id}`
    } catch (err: any) {
      console.log('❌ Direct insert failed:', err.message)
    }

    // 4. Check if schema 'auth' is accessible
    console.log('\n4️⃣ Checking auth schema access...')
    try {
      const authCheck = await sql`
        SELECT COUNT(*) FROM auth.users LIMIT 1
      `
      console.log('✅ Can access auth.users')
    } catch (err: any) {
      console.log('❌ Cannot access auth.users:', err.message)
    }

    // 5. Check for any existing errors in pg_stat_statements (if available)
    console.log('\n5️⃣ Recommendations:')
    console.log('   • Check Supabase Dashboard → Logs → Postgres Logs')
    console.log('   • Look for errors around signup time')
    console.log('   • The trigger might be executing but hitting a different error')
    
    console.log('\n6️⃣ Try this workaround:')
    console.log('   Delete and recreate the trigger:')
    console.log('   ')
    console.log('   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;')
    console.log('   CREATE TRIGGER on_auth_user_created')
    console.log('     AFTER INSERT ON auth.users')
    console.log('     FOR EACH ROW')
    console.log('     EXECUTE FUNCTION public.handle_new_user();')

  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await sql.end()
  }
}

diagnoseTrigger()
