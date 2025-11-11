'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormValues = z.infer<typeof signInSchema>

interface SignInFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function SignInForm({ onSuccess, redirectTo = '/' }: SignInFormProps) {
  const { signIn } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: SignInFormValues) => {
    console.log('🔐 Sign in started')
    setLoading(true)
    setError(null)

    const { data, error: signInError } = await signIn({
      email: values.email,
      password: values.password,
    })

    console.log('🔐 Sign in response:', { data: !!data, error: !!signInError })

    if (signInError) {
      console.error('❌ Sign in error:', signInError)
      if (signInError.message?.includes('Email not confirmed')) {
        setError('Please confirm your email address. Check your inbox for the confirmation link.')
      } else {
        setError('Invalid credentials. Please try again.')
      }
      setLoading(false)
      return
    }

    if (data?.user) {
      console.log('✅ User authenticated:', data.user.id, data.user.email)
      onSuccess?.()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        console.log('🔄 Fetching user role from API...')
        const response = await fetch('/api/user/role', {
          method: 'GET',
          credentials: 'include',
        })
        
        if (!response.ok) {
          throw new Error(`Role fetch failed: ${response.status}`)
        }
        
        const { role } = await response.json()
        console.log('👤 User role from DB:', role)
        
        const destination = role === 'admin' ? '/admin' : '/dashboard'
        console.log('📍 Redirecting to:', destination)
        window.location.href = destination
        return
      } catch (err) {
        console.error('❌ Error fetching role:', err)
        console.log('📍 Fallback redirect to:', redirectTo)
        window.location.href = redirectTo
        return
      }
    }

    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="h-12 w-12" />
              <p className="text-lg font-medium">Signing you in...</p>
              <p className="text-sm text-muted-foreground">Please wait</p>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  )
}
