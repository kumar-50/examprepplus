'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordChangeModal } from './password-change-modal'
import { Button } from '@/components/ui/button'
import { Shield, Key } from 'lucide-react'

interface SecuritySectionProps {
  userId: string
}

export function SecuritySection({ userId }: SecuritySectionProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  return (
    <>
      <Card id="security">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Verification Status */}
          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium">Email Verification</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your email is verified
              </p>
              <p className="text-xs text-green-600 mt-1">✅ Verified</p>
            </div>
          </div>

          {/* Password */}
          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Keep your account secure by using a strong password
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PasswordChangeModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </>
  )
}
