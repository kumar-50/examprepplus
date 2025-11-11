import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndSetAdmin() {
  const email = 'muthu09612@gmail.com'
  const userId = '8dfbad7a-7b60-4d56-981f-c742666b8a63'

  console.log('🔍 Checking user in database...')
  
  // Check user
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (fetchError) {
    console.error('❌ Error fetching user:', fetchError)
    
    if (fetchError.code === 'PGRST116') {
      console.log('ℹ️  User not found, checking by email...')
      
      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (userByEmail) {
        console.log('Found user by email:', userByEmail)
      } else {
        console.log('❌ User not found by email either')
      }
    }
    return
  }

  console.log('Current user:', user)
  
  if (user.role === 'admin') {
    console.log('✅ User is already admin')
    return
  }

  console.log('⚠️  User is not admin, updating...')
  
  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', userId)
    .select()
    .single()

  if (updateError) {
    console.error('❌ Error updating user:', updateError)
    return
  }

  console.log('✅ User updated to admin:', updated)
}

checkAndSetAdmin()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
