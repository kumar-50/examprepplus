import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Toaster } from '@/components/ui/toaster'
import { userNavItems } from '@/config/navigation'
import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('📄 Dashboard layout rendering')
  let user
  try {
    user = await requireAuth()
    console.log('✅ Dashboard layout: User authenticated', user.id)
  } catch (error) {
    console.log('❌ Dashboard layout: Auth failed, redirecting to login')
    redirect('/login?redirect=/dashboard')
  }

  // Get user details from database
  console.log('🔍 Fetching user from database:', user.id)
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  console.log('🔍 DB user:', dbUser ? 'found' : 'not found')

  if (!dbUser) {
    console.log('❌ User not in database, redirecting to login')
    redirect('/login')
  }

  return (
    <>
      <DashboardLayout
        navItems={userNavItems}
        title="My Dashboard"
        user={{
          email: dbUser.email,
          fullName: dbUser.fullName,
          role: dbUser.role,
        }}
      >
        {children}
      </DashboardLayout>
      <Toaster />
    </>
  )
}
