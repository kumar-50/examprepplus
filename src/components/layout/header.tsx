'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/auth/user-nav'
import { Logo } from '@/components/ui/logo'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${
      isScrolled ? 'lg:fixed lg:shadow-md' : 'relative'
    }`}>
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <Logo width={40} height={31} showText={false} href="/" />
        
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
          <Link
            href="#features"
            className="transition-colors hover:text-primary text-muted-foreground whitespace-nowrap"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="transition-colors hover:text-primary text-muted-foreground whitespace-nowrap"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-primary text-muted-foreground whitespace-nowrap"
          >
            Pricing
          </Link>
          <Link
            href="#contact"
            className="transition-colors hover:text-primary text-muted-foreground whitespace-nowrap"
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
