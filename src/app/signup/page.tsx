import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { SignUpForm } from '@/components/auth/signup-form'
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
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[var(--bg-primary)] overflow-y-auto">
        <div className="w-full max-w-md space-y-4 py-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--heading)]">Create Account</h1>
            <p className="text-sm sm:text-base text-[var(--body-text)]">
              Start your exam preparation journey today
            </p>
          </div>

          {/* Form */}
          <SignUpForm redirectTo="/dashboard" />

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-sm text-[var(--body-text)]">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--brand-primary)] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--brand-light)] to-white items-center justify-center p-8 overflow-y-auto">
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
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--heading)]">Join Thousands of Aspirants</h2>
            <p className="text-[var(--body-text)] text-sm">
              Start your journey to success with ExamPrepPlus
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--brand-primary)]">50K+</div>
              <div className="text-xs text-[var(--muted-text)]">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--brand-primary)]">10K+</div>
              <div className="text-xs text-[var(--muted-text)]">Success Stories</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--brand-primary)]">4.8★</div>
              <div className="text-xs text-[var(--muted-text)]">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
