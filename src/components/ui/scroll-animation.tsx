"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ScrollAnimationProps {
  children: React.ReactNode
  className?: string
  animation?: "fade-in" | "slide-up" | "slide-left" | "slide-right" | "zoom-in"
  duration?: number
  delay?: number
  threshold?: number
}

export function ScrollAnimation({ 
  children, 
  className, 
  animation = "slide-up",
  duration = 700,
  delay = 0,
  threshold = 0.1
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold])

  const getAnimationClass = () => {
    switch (animation) {
      case "fade-in":
        return "animate-in fade-in"
      case "slide-up":
        return "animate-in fade-in slide-in-from-bottom-12"
      case "slide-left":
        return "animate-in fade-in slide-in-from-right-12"
      case "slide-right":
        return "animate-in fade-in slide-in-from-left-12"
      case "zoom-in":
        return "animate-in fade-in zoom-in-95"
      default:
        return "animate-in fade-in slide-in-from-bottom-12"
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        isVisible ? getAnimationClass() : "opacity-0 invisible",
        className
      )}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  )
}
