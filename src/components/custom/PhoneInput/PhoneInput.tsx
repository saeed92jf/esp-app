// components/ui/PhoneInput.tsx
'use client'

import { forwardRef, useState } from 'react'
import { Input, InputProps } from '@/components/ui'
import { cn } from '@/lib/utils'

// ============================================
// PHONE INPUT COMPONENT
// Enhanced phone number input with formatting and validation
// Automatically formats as (XXX) XXX-XXXX
// Supports country code prefix
// Uses Tailwind CSS only - inherits styles from Input component
// ============================================

export interface PhoneInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  /**
   * Callback fired when phone value changes
   * @param value - The formatted phone number
   * @param isValid - Whether the phone number is valid (10-15 digits)
   */
  onChange?: (value: string, isValid: boolean) => void
  
  /**
   * Country code to display as prefix (e.g., '+1', '+44', '+98')
   * @default '+1'
   */
  countryCode?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, value: initialValue = '', countryCode = '+1', className, ...props }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const [error, setError] = useState('')

    /**
     * Validates phone number length (10-15 digits)
     */
    const validatePhone = (phone: string): boolean => {
      const digits = phone.replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 15
    }

    /**
     * Formats phone number to (XXX) XXX-XXXX format
     * Removes all non-digits and applies progressive formatting
     */
    const formatPhone = (phone: string): string => {
      const digits = phone.replace(/\D/g, '')
      if (digits.length === 0) return ''
      if (digits.length <= 3) return `(${digits}`
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const formattedValue = formatPhone(rawValue)
      setValue(formattedValue)
      
      // Empty value - clear error but mark as invalid
      if (formattedValue === '') {
        setError('')
        onChange?.(formattedValue, false)
        return
      }
      
      // Validate phone number length
      const isValid = validatePhone(formattedValue)
      setError(isValid ? '' : 'Please enter a valid phone number')
      onChange?.(formattedValue, isValid)
    }

    return (
      <div className="relative">
        {/* Country code prefix */}
        {countryCode && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none z-10">
            <span className="text-sm">{countryCode}</span>
          </div>
        )}
        
        {/* Phone input field */}
        <Input
          ref={ref}
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder="(555) 555-5555"
          error={error}
          className={cn(countryCode && 'pl-12', className)}
          {...props}
        />
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'