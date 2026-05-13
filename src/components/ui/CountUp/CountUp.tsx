'use client'

import { useEffect, useState, useRef } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  start?: number
  decimals?: number
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

  useEffect(() => {
    if (!isVisible) return

    const stepTime = 20
    const steps = duration / stepTime
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
        setCount(Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [isVisible, end, start, duration, decimals])

  return (
    <span ref={elementRef} className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  )
}