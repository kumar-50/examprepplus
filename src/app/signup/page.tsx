import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignUpForm } from '@/components/auth/signup-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, getUserProfile } from '@/lib/auth/server'

export const metadata: Metadata = {
  title: 'Sign Up | ExamPrepPlus',
  description: 'Create your ExamPrepPlus account',
}

export default async function SignUpPage() {
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
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started with ExamPrepPlus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm redirectTo="/dashboard" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
