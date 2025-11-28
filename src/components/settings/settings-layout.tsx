'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { User, Shield, Gift, AlertTriangle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SettingsLayoutProps {
  children: React.ReactNode
}

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'referral', label: 'Referral Program', icon: Gift },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const [activeSection, setActiveSection] = useState('profile')

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="sticky top-6 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    activeSection === section.id && 'bg-secondary'
                  )}
                  onClick={() => scrollToSection(section.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {section.label}
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'secondary' : 'outline'}
                size="sm"
                className="shrink-0"
                onClick={() => scrollToSection(section.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {section.label}
              </Button>
            )
          })}
        </div>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
