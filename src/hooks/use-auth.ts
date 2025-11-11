'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { useSessionUser } from './use-session-user'

interface SignUpParams {
  email: string
  password: string
  fullName?: string
}

interface SignInParams {
  email: string
  password: string
}

/**
 * Comprehensive auth hook providing sign up, sign in, sign out functionality
 * with session state management.
 */
export function useAuth() {
  const { user, loading: sessionLoading, error: sessionError } = useSessionUser()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const signUp = async ({ email, password, fullName }: SignUpParams) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Sign up failed'),
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async ({ email, password }: SignInParams) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Sign in failed'),
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      router.push('/')
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        error: error instanceof Error ? error : new Error('Sign out failed'),
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading: sessionLoading || loading,
    error: sessionError,
    signUp,
    signIn,
    signOut,
  }
}
