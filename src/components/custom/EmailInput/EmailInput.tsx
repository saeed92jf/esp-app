// components/ui/EmailInput.tsx
'use client'

import { forwardRef, useState } from 'react'
import { Input, InputProps } from '@/components/ui'
import { cn } from '@/lib/utils'

// ============================================
// EMAIL INPUT COMPONENT
// Enhanced email input with built-in validation
// Wraps the base Input component with email-specific logic
// Uses Tailwind CSS only - inherits styles from Input component
// ============================================

export interface EmailInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  /**
   * Callback fired when email value changes
   * @param value - The current email value
   * @param isValid - Whether the email format is valid
   */
  onChange?: (value: string, isValid: boolean) => void
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ onChange, value: initialValue = '', className, ...props }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const [error, setError] = useState('')

    /**
     * Validates email format using regex
     * Supports standard email formats: name@domain.com
     */
    const validateEmail = (email: string): boolean => {
      // Email regex: allows letters, numbers, dots, hyphens, underscores before @
      // Then domain with at least one dot and valid TLD
      const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
      return emailRegex.test(email)
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
      
      // Validate email format
      const isValid = validateEmail(newValue)
      setError(isValid ? '' : 'Please enter a valid email address')
      onChange?.(newValue, isValid)
    }

    return (
      <Input
        ref={ref}
        type="email"
        value={value}
        onChange={handleChange}
        error={error}
        className={cn(className)}
        {...props}
      />
    )
  }
)

EmailInput.displayName = 'EmailInput'