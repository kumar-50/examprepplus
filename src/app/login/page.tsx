import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/components/auth/signin-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, getUserProfile } from '@/lib/auth/server'

export const metadata: Metadata = {
  title: 'Sign In | ExamPrepPlus',
  description: 'Sign in to your ExamPrepPlus account',
}

export default async function LoginPage() {
  // Check if user is already authenticated
  const user = await getCurrentUser()
  
  if (user) {
    // Get user profile to check role
    const profile = await getUserProfile(user.id)
    
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to your ExamPrepPlus account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm redirectTo="/dashboard" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
