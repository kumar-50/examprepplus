'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/auth/user-nav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <span className="font-bold text-lg sm:text-xl whitespace-nowrap">
            <span className="text-primary">ExamPrep</span>
            <span className="text-secondary">Plus</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
          <Link
            href="#features"
            className="transition-colors hover:text-primary text-foreground/80 whitespace-nowrap"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="transition-colors hover:text-primary text-foreground/80 whitespace-nowrap"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-primary text-foreground/80 whitespace-nowrap"
          >
            Pricing
          </Link>
          <Link
            href="#contact"
            className="transition-colors hover:text-primary text-foreground/80 whitespace-nowrap"
          >
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button variant="ghost" asChild className="hidden sm:inline-flex text-sm">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild size="sm" className="sm:size-default text-sm">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
