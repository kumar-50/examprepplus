import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/components/auth/signin-form'
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
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[var(--bg-primary)] overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--heading)]">Sign In</h1>
            <p className="text-sm sm:text-base text-[var(--body-text)]">
              Access your account to continue learning
            </p>
          </div>

          {/* Form */}
          <SignInForm redirectTo="/dashboard" />

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-[var(--body-text)]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[var(--brand-primary)] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--brand-light)] to-white items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="relative w-full aspect-square max-w-sm mx-auto">
            <Image
              src="/hero.png"
              alt="Student learning"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--heading)]">Welcome Back!</h2>
            <p className="text-[var(--body-text)] text-sm sm:text-base">
              Continue your journey to exam success
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
