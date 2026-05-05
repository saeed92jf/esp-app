'use client'

import { forwardRef } from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 shadow-sm',
      hover: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer',
    }
    
    return (
      <div ref={ref} className={`${variants[variant]} ${className || ''}`} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 ${className || ''}`} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`text-gray-600 dark:text-gray-300 ${className || ''}`} {...props} />
  )
)
CardContent.displayName = 'CardContent'