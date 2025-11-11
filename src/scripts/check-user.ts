import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const checkUser = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

  console.log('🔍 Checking user: muthu08612@gmail.com\n')

  try {
    // Check auth.users
    const authUsers = await sql`
      SELECT id, email, email_confirmed_at, created_at
      FROM auth.users
      WHERE email = 'muthu08612@gmail.com'
    `

    if (authUsers.length === 0) {
      console.log('❌ User NOT found in auth.users')
      console.log('   → You need to sign up first!')
      console.log('   → Go to: http://localhost:3000/signup')
    } else {
      console.log('✅ User found in auth.users:')
      console.log(`   ID: ${authUsers[0].id}`)
      console.log(`   Email: ${authUsers[0].email}`)
      console.log(`   Confirmed: ${authUsers[0].email_confirmed_at ? 'Yes ✅' : 'No ❌'}`)
      console.log(`   Created: ${authUsers[0].created_at}`)

      if (!authUsers[0].email_confirmed_at) {
        console.log('\n⚠️  Email not confirmed!')
        console.log('   Option 1: Disable email confirmation in Supabase')
        console.log('   Option 2: Run this SQL to confirm:')
        console.log(`   UPDATE auth.users SET email_confirmed_at = NOW(), confirmed_at = NOW() WHERE email = 'muthu08612@gmail.com';`)
      }

      // Check public.users
      const publicUsers = await sql`
        SELECT id, email, full_name, role
        FROM public.users
        WHERE email = 'muthu08612@gmail.com'
      `

      if (publicUsers.length === 0) {
        console.log('\n❌ User NOT found in public.users')
        console.log('   → Trigger may not have fired. Run this SQL:')
        console.log(`   INSERT INTO public.users (id, email, created_at, updated_at)`)
        console.log(`   VALUES ('${authUsers[0].id}', '${authUsers[0].email}', NOW(), NOW())`)
        console.log(`   ON CONFLICT (id) DO NOTHING;`)
      } else {
        console.log('\n✅ User found in public.users:')
        console.log(`   ID: ${publicUsers[0].id}`)
        console.log(`   Email: ${publicUsers[0].email}`)
        console.log(`   Name: ${publicUsers[0].full_name || '(empty)'}`)
        console.log(`   Role: ${publicUsers[0].role}`)
      }
    }

    // Check email confirmation setting
    console.log('\n📋 To fix login issues:')
    console.log('1. Go to Supabase Dashboard → Authentication → Providers → Email')
    console.log('2. Uncheck "Enable email confirmations"')
    console.log('3. Click Save')
    console.log('4. Try logging in again')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sql.end()
  }
}

checkUser()
