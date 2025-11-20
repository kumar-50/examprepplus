'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NavItem, iconMap } from '@/config/navigation'

interface SidebarNavProps {
  items: NavItem[]
  collapsed?: boolean
  onLinkClick?: () => void
}

export function SidebarNav({ items, collapsed = false, onLinkClick }: SidebarNavProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  return (
    <nav className="space-y-1 px-3">
      {items.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap]
        // Exact match for dashboard routes, prefix match for others
        const isActive = item.href === '/dashboard' || item.href === '/admin'
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/')
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? item.title : undefined}
          >
            {Icon && <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />}
            {!collapsed && (
              <>
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
