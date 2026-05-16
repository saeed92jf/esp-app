// components/ui/FeatureCard.tsx
'use client'

import { forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

// ============================================
// FEATURE CARD COMPONENT
// For displaying product/service features
// Uses Tailwind CSS only - no separate CSS file needed
// All animations are defined in tailwind.config.ts
// ============================================

export interface FeatureCardProps {
  /** FontAwesome icon to display */
  icon: any
  /** Feature title */
  title: string
  /** Feature description */
  description: string
  /** URL to navigate to */
  href: string
  /** Optional CSS classes */
  className?: string
  /** Gradient class for the icon background */
  gradient?: string
}

export const FeatureCard = forwardRef<HTMLAnchorElement, FeatureCardProps>(
  ({ icon, title, description, href, className, gradient }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          // Base styles
          'group block p-6 rounded-2xl',
          'bg-primary border border-light',
          'transition-all duration-300 ease-out',
          'cursor-pointer no-underline',
          'hover:-translate-y-2 hover:shadow-xl hover:border-primary',
          className
        )}
      >
        {/* Icon container */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl mb-4',
            'flex items-center justify-center',
            'transition-all duration-300 ease-out',
            'bg-tertiary',
            'group-hover:bg-primary group-hover:scale-105',
            gradient
          )}
        >
          <FontAwesomeIcon
            icon={icon}
            className={cn(
              'text-xl transition-colors duration-300',
              'text-primary',
              'group-hover:text-inverse'
            )}
          />
        </div>

        {/* Title */}
        <h3
          className={cn(
            'text-lg font-semibold mb-2 transition-colors duration-300',
            'text-primary',
            'group-hover:text-primary'
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            'text-sm leading-relaxed transition-colors duration-300',
            'text-secondary'
          )}
        >
          {description}
        </p>

        {/* Learn more link - appears on hover */}
        <div
          className={cn(
            'inline-flex items-center gap-2 mt-4',
            'text-sm font-medium text-primary',
            'transition-all duration-300 ease-out',
            'opacity-0 translate-x-0',
            'group-hover:opacity-100 group-hover:translate-x-1'
          )}
        >
          Learn more
          <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </Link>
    )
  }
)

FeatureCard.displayName = 'FeatureCard'