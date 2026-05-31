'use client'

import { forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

export interface FeatureCardProps {
  icon: any
  title: string
  description: string
  href: string
  className?: string
  gradient?: string
  iconColor?: string
}

export const FeatureCard = forwardRef<HTMLAnchorElement, FeatureCardProps>(
  ({ icon, title, description, href, className, gradient, iconColor }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
      className={cn(
  'group block p-6 rounded-2xl',
  'bg-primary',
  'border border-light',
  'transition-all duration-500 ease-out',
  'cursor-pointer no-underline',
  'hover:-translate-y-1 hover:shadow-lg hover:border-primary',
  className
)}
      >
        <div
          className={cn(
            'w-14 h-14 rounded-full mb-4',
            'flex items-center justify-center',
            'transition-all duration-500 ease-out',
            'bg-tertiary',
            'group-hover:bg-gradient-primary ',
            gradient
          )}
        >
          <FontAwesomeIcon
            icon={icon}
            className={cn(
              'text-xl transition-all duration-500 ease-out',
              iconColor || 'text-primary',
              'group-hover:text-inverse'
            )}
          />
        </div>

        <h3 className="text-lg font-semibold mb-2 text-primary">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-secondary">
          {description}
        </p>

        <div
          className={cn(
            'inline-flex items-center gap-2 mt-4',
            'text-sm font-medium',
            'transition-all duration-500 ease-out',
            'opacity-0 -translate-x-3',
            'group-hover:opacity-100 group-hover:translate-x-0',
            'text-primary'
          )}
        >
          <span>Learn more</span>
          <FontAwesomeIcon 
            icon={faChevronRight} 
            className="w-3.5 h-3.5 transition-all duration-500 group-hover:translate-x-1" 
          />
        </div>
      </Link>
    )
  }
)

FeatureCard.displayName = 'FeatureCard'