import { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/server'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { ProfileSection } from '@/components/settings/profile-section'
import { SecuritySection } from '@/components/settings/security-section'
import { DangerZone } from '@/components/settings/danger-zone'

export const metadata: Metadata = {
  title: 'Settings | ExamPrepPlus',
  description: 'Manage your account settings and preferences',
}

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <ProfileSection userId={user.id} />
        <SecuritySection userId={user.id} />
        <DangerZone userId={user.id} />
      </div>
    </SettingsLayout>
  )
}
