// components/ui/CountUp.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// COUNTUP COMPONENT
// Animated number counter that starts when visible in viewport
// Uses Tailwind CSS only - styling is passed via className prop
// ============================================

export interface CountUpProps {
  /**
   * Target number to count up to
   */
  end: number
  
  /**
   * Animation duration in milliseconds
   * @default 2000
   */
  duration?: number
  
  /**
   * Text to display after the number (e.g., '+', '%')
   * @default ''
   */
  suffix?: string
  
  /**
   * Text to display before the number (e.g., '$', '€')
   * @default ''
   */
  prefix?: string
  
  /**
   * Starting number (usually 0)
   * @default 0
   */
  start?: number
  
  /**
   * Number of decimal places to show
   * @default 0
   */
  decimals?: number
  
  /**
   * Additional CSS classes for styling (use Tailwind classes)
   * @example 'text-3xl font-bold text-primary'
   */
  className?: string
}

export function CountUp({ 
  end, 
  duration = 2000, 
  suffix = '', 
  prefix = '', 
  start = 0,
  decimals = 0,
  className = ''
}: CountUpProps) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  // Intersection Observer - start animation when element enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Count-up animation logic
  useEffect(() => {
    if (!isVisible) return

    // Calculate animation steps
    const stepTime = 20 // milliseconds per step (50fps)
    const steps = Math.floor(duration / stepTime)
    const increment = (end - start) / steps
    let current = start
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      
      if (step >= steps) {
        setCount(end)
        clearInterval(timer)
      } else {
        // Round to specified decimal places
        const rounded = Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals)
        setCount(rounded)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [isVisible, end, start, duration, decimals])

  return (
    <span ref={elementRef} className={cn(className)}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  )
}