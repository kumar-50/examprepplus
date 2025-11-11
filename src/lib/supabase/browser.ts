import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

/**
 * Get a singleton Supabase client for browser-side operations.
 * This ensures the client is not re-instantiated on hot reload.
 */
export function getSupabaseBrowserClient() {
  if (client) {
    if (process.env.NODE_ENV === 'development') {
      console.log('♻️ Reusing existing Supabase browser client')
    }
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  if (process.env.NODE_ENV === 'development') {
    console.log('✨ Created new Supabase browser client')
  }

  return client
}
