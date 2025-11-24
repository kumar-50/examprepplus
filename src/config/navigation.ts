import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  CreditCard,
  Tag,
  BookOpen,
  FolderTree,
  List,
  TrendingUp
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: string // Changed from React component to string
  badge?: string
}

export const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Sections',
    href: '/admin/sections',
    icon: 'FolderTree',
  },
  {
    title: 'Topics',
    href: '/admin/topics',
    icon: 'List',
  },
  {
    title: 'Questions',
    href: '/admin/questions',
    icon: 'FileText',
  },
  {
    title: 'Tests',
    href: '/admin/tests',
    icon: 'BookOpen',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: 'Users',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: 'BarChart3',
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: 'CreditCard',
  },
  {
    title: 'Coupons',
    href: '/admin/coupons',
    icon: 'Tag',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: 'Settings',
  },
]

export const userNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Mock Tests',
    href: '/dashboard/tests',
    icon: 'BookOpen',
  },
  {
    title: 'Practice',
    href: '/dashboard/practice',
    icon: 'FileText',
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'TrendingUp',
  },
  {
    title: 'Progress',
    href: '/dashboard/progress',
    icon: 'BarChart3',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: 'Settings',
  },
]

// Icon map for client components
export const iconMap = {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  CreditCard,
  Tag,
  BookOpen,
  FolderTree,
  List,
  TrendingUp,
} as const
