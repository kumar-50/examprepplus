'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { useSessionUser } from '@/hooks/use-session-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'

export default function AuthTestPage() {
  const { user, loading: sessionLoading } = useSessionUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = getSupabaseBrowserClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.user) {
        setMessage({ 
          type: 'success', 
          text: 'Sign up successful! Check your email for verification.' 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.user) {
        setMessage({ type: 'success', text: 'Sign in successful!' })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Signed out successfully!' })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      })
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Auth Test Page</CardTitle>
          <CardDescription>
            Test Supabase authentication (email/password)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {user ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Signed in as:</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-2">User ID: {user.id}</p>
              </div>
              <Button onClick={handleSignOut} disabled={loading} className="w-full">
                {loading ? <Spinner className="h-4 w-4" /> : 'Sign Out'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? <Spinner className="h-4 w-4" /> : 'Sign In'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSignUp} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <Spinner className="h-4 w-4" /> : 'Sign Up'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
