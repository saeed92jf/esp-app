'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  showCount?: boolean
  maxLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxLength, value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-25 w-full rounded-md border border-gray-300 bg-white px-3 py-2',
            'text-sm placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {(error || (showCount && maxLength)) && (
          <div className="flex justify-between mt-1">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {showCount && maxLength && (
              <p className={`text-xs ${currentLength > maxLength ? 'text-red-500' : 'text-gray-400'}`}>
                {currentLength} / {maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'