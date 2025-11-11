'use client'

import { useEffect, useState } from 'react'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

/**
 * Hook to get the current authenticated user session.
 * Returns user metadata and session state.
 */
export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          setError(sessionError)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to get session')
        )
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
