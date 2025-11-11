import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { adminNavItems } from '@/config/navigation'
import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'
import { Toaster } from '@/components/ui/toaster'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let authUser
  try {
    const result = await requireAdmin()
    authUser = result.user
  } catch (error) {
    // Redirect to login if not authenticated or not admin
    redirect('/login?redirect=/admin')
  }

  // Get user details from database
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)

  if (!dbUser) {
    redirect('/login')
  }

  return (
    <DashboardLayout
      navItems={adminNavItems}
      title="Admin Panel"
      user={{
        email: dbUser.email,
        fullName: dbUser.fullName,
        role: dbUser.role,
      }}
    >
      {children}
      <Toaster />
    </DashboardLayout>
  )
}
