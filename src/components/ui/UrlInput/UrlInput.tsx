// components/ui/UrlInput.tsx
'use client'

import { forwardRef, useState } from 'react'
import { Input, InputProps } from '@/components/ui'
import { cn } from '@/lib/utils'

// ============================================
// URL INPUT COMPONENT
// Enhanced URL input with built-in validation
// Validates URL format using native URL constructor
// Shows error message for invalid URLs
// Uses Tailwind CSS only - inherits styles from Input component
// ============================================

export interface UrlInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  /**
   * Callback fired when URL value changes
   * @param value - The current URL value
   * @param isValid - Whether the URL format is valid
   */
  onChange?: (value: string, isValid: boolean) => void
}

export const UrlInput = forwardRef<HTMLInputElement, UrlInputProps>(
  ({ onChange, value: initialValue = '', className, ...props }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const [error, setError] = useState('')

    /**
     * Validates URL format using native URL constructor
     * @returns true if URL is valid, false otherwise
     */
    const validateUrl = (url: string): boolean => {
      // Empty URL is handled separately (not considered valid)
      if (!url) return false
      
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      
      // Empty value - clear error but mark as invalid
      if (newValue === '') {
        setError('')
        onChange?.(newValue, false)
        return
      }
      
      // Validate URL format
      const isValid = validateUrl(newValue)
      setError(isValid ? '' : 'Please enter a valid URL (e.g., https://example.com)')
      onChange?.(newValue, isValid)
    }

    return (
      <Input
        ref={ref}
        type="url"
        value={value}
        onChange={handleChange}
        error={error}
        className={cn(className)}
        {...props}
      />
    )
  }
)

UrlInput.displayName = 'UrlInput'