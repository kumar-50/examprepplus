import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/components/auth/signin-form'
import { getCurrentUser, getUserProfile } from '@/lib/auth/server'
import { Logo } from '@/components/ui/logo'

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
    <div className="h-screen flex flex-col md:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-4">
          {/* Logo for all screens */}
          <div className="mb-6 text-center">
            <Logo className="mx-auto" width={120} height={93} />
          </div>
          
          {/* Header */}
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Sign In</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Access your account to continue learning
            </p>
          </div>

          {/* Form */}
          <SignInForm redirectTo="/dashboard" />

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration (Tablet & Desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/5 to-background items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="relative w-full aspect-square max-w-xs mx-auto">
            <Image
              src="/hero.png"
              alt="Students learning together"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold">Join Thousands of Aspirants</h2>
            <p className="text-muted-foreground text-sm">
              Start your journey to success with ExamPrepPlus
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">50K+</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">10K+</div>
              <div className="text-xs text-muted-foreground">Success Stories</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">4.8★</div>
              <div className="text-xs text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
