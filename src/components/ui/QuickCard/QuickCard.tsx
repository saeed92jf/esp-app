'use client'

import { forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export interface QuickCardProps {
  icon: any
  title: string
  href: string
  subtitle?: string
  isAuthenticated?: boolean
  className?: string
  gradient?: string
  iconColor?: string
}

export const QuickCard = forwardRef<HTMLAnchorElement, QuickCardProps>(
  ({ icon, title, href, subtitle, isAuthenticated = true, className, gradient, iconColor }, ref) => {
    return (
      <Link
        ref={ref}
        href={isAuthenticated ? href : '/login'}
        className={cn(
          'group block text-center p-4 rounded-2xl',
          'transition-all duration-300 ease-out',
          'cursor-pointer',
          'hover:bg-secondary',
          className
        )}
      >
        <div
          className={cn(
            'w-14 h-14 mx-auto mb-3 rounded-full',
            'flex items-center justify-center',
            'bg-tertiary',
            'group-hover:bg-primary',
            gradient
          )}
        >
          <FontAwesomeIcon
            icon={icon}
            className={cn(
              'w-6 h-6 transition-colors duration-300',
              iconColor || 'text-secondary',
              'group-hover:text-inverse'
            )}
          />
        </div>
        <div className="text-sm font-semibold text-secondary transition-colors duration-300 group-hover:text-primary">
          {title}
        </div>
        {!isAuthenticated && subtitle && (
          <div className="text-xs text-tertiary mt-1">{subtitle}</div>
        )}
      </Link>
    )
  }
)

QuickCard.displayName = 'QuickCard'