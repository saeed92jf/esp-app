'use client'

import { forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/lib/utils'
import { CountUp } from '@/components/ui'

export interface StatsCardProps {
  icon: any
  value: number
  label: string
  suffix?: string
  className?: string
  iconColor?: string 
  delay?: number
  isRevealed?: boolean
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ icon, value, label, suffix = '', className, iconColor, delay = 0, isRevealed = false }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-center p-6 rounded-2xl',
          isRevealed ? 'animate-fade-in-up' : 'opacity-0',
          className
        )}
        style={{ animationDelay: isRevealed ? `${delay * 100}ms` : '0ms' }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center">
          <FontAwesomeIcon 
  icon={icon} 
  className={cn(
    'w-10 h-10 md:w-12 md:h-12',  
    'text-3xl md:text-4xl',       
    iconColor || 'text-primary'
  )}
/>
        </div>
        
        <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
          <CountUp end={value} suffix={suffix} duration={2000} />
        </div>
        
        <div className="text-sm font-medium text-secondary">{label}</div>
      </div>
    )
  }
)

StatsCard.displayName = 'StatsCard'