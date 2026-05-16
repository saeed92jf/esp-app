// components/ui/StatsCard.tsx
'use client'

import { forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/lib/utils'
import { CountUp } from '@/components/ui'

// ============================================
// STATS CARD COMPONENT
// For displaying statistics with count-up animation
// Uses Tailwind CSS only - no separate CSS file needed
// ============================================

export interface StatsCardProps {
  /** FontAwesome icon to display */
  icon: any
  /** Statistic value */
  value: number
  /** Statistic label */
  label: string
  /** Suffix after the value (e.g., '+', '%') */
  suffix?: string
  /** Optional CSS classes */
  className?: string
  /** Gradient class for the icon background */
  gradient?: string
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ icon, value, label, suffix = '', className, gradient }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'text-center p-6 rounded-2xl',
          'bg-primary border border-light',
          'shadow-sm transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-lg hover:border-primary',
          className
        )}
      >
        {/* Icon container */}
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-xl',
            'flex items-center justify-center',
            gradient || 'bg-tertiary'
          )}
        >
          <FontAwesomeIcon icon={icon} className="w-7 h-7 text-primary" />
        </div>

        {/* CountUp value */}
        <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
          <CountUp end={value} suffix={suffix} duration={2000} />
        </div>

        {/* Label */}
        <div className="text-sm font-medium text-secondary">{label}</div>
      </div>
    )
  }
)

StatsCard.displayName = 'StatsCard'