// components/ui/QuickCard.tsx
'use client'

import { forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ============================================
// QUICK ACCESS CARD COMPONENT
// For dashboard quick action buttons
// Uses Tailwind CSS only - no separate CSS file needed
// ============================================

export interface QuickCardProps {
  /** FontAwesome icon to display */
  icon: any
  /** Card title text */
  title: string
  /** URL to navigate to */
  href: string
  /** Optional subtitle (shown when not logged in) */
  subtitle?: string
  /** Whether user is authenticated */
  isAuthenticated?: boolean
  /** Optional CSS classes */
  className?: string
  /** Gradient class for the icon background */
  gradient?: string
}

export const QuickCard = forwardRef<HTMLAnchorElement, QuickCardProps>(
  ({ icon, title, href, subtitle, isAuthenticated = true, className, gradient }, ref) => {
    return (
      <Link
        ref={ref}
        href={isAuthenticated ? href : '/login'}
        className={cn(
          // Base styles
          'group block text-center p-4 rounded-3xl',
          'transition-all duration-300 ease-out',
          'cursor-pointer',
          'hover:bg-tertiary',
          className
        )}
      >
        {/* Icon container */}
        <div
          className={cn(
            'w-14 h-14 mx-auto mb-4 rounded-full',
            'flex items-center justify-center',
            'transition-all duration-300 ease-out',
            'bg-tertiary',
            'group-hover:bg-primary',
            gradient
          )}
        >
          <FontAwesomeIcon
            icon={icon}
            className={cn(
              'w-6 h-6 transition-all duration-300',
              'text-secondary',
              'group-hover:text-inverse'
            )}
          />
        </div>

        {/* Title */}
        <div
          className={cn(
            'text-sm font-semibold transition-colors duration-300',
            'text-secondary',
            'group-hover:text-primary'
          )}
        >
          {title}
        </div>

        {/* Subtitle (for non-authenticated users) */}
        {subtitle && !isAuthenticated && (
          <div className="text-xs text-tertiary mt-1">{subtitle}</div>
        )}
      </Link>
    )
  }
)

QuickCard.displayName = 'QuickCard'