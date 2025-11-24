'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarNav } from './sidebar-nav'
import { UserNav } from '@/components/auth/user-nav'
import { NavItem } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  title: string
  user: {
    email: string
    fullName?: string | null
    role: string
  }
}

export function DashboardLayout({ children, navItems, title, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r bg-sidebar transition-all duration-300 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      >
        {/* Logo/Brand */}
        <div className={cn("flex h-16 shrink-0 items-center border-b px-4", sidebarCollapsed && "justify-center")}>
          {!sidebarCollapsed && (
            <Logo width={32} height={25} showText={true} href="/" />
          )}
          {sidebarCollapsed && (
            <Logo width={32} height={25} showText={false} href="/" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {!sidebarCollapsed && (
            <div className="mb-2 px-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </p>
            </div>
          )}
          <SidebarNav 
            items={navItems} 
            collapsed={sidebarCollapsed} 
            onLinkClick={() => setSidebarOpen(false)}
          />
        </div>

        {/* User info at bottom */}
        <div className="mt-auto border-t">
          {!sidebarCollapsed && (
            <div className="p-4">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-prussian-blue-500 text-white">
                  <span className="text-sm font-semibold">
                    {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{user.fullName || 'User'}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex items-center justify-center p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-prussian-blue-500 text-white">
                <span className="text-sm font-semibold">
                  {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Toggle button for desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
          
          <div className="flex flex-1 items-center justify-end gap-4">
            <UserNav user={user} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
