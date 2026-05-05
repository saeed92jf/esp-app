'use client'

import { forwardRef, useState, useEffect } from 'react'
import { BasePasswordInput } from './BasePasswordInput'
import { cn } from '@/lib/cn'

export interface ConfirmPasswordInputProps {
  name?: string
  value?: string
  passwordValue?: string
  onChange?: (value: string, isValid: boolean) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
}

export const ConfirmPasswordInput = forwardRef<HTMLInputElement, ConfirmPasswordInputProps>(
  ({ 
    name,
    value,
    passwordValue = '',
    onChange,
    placeholder = 'Confirm your password',
    label = 'Confirm Password',
    required = false,
    disabled = false,
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '')
    const [error, setError] = useState('')

    const validateConfirmPassword = (confirmValue: string): string => {
      if (required && !confirmValue) {
        return 'Please confirm your password'
      }
      if (confirmValue !== passwordValue) {
        return 'Passwords do not match'
      }
      return ''
    }

    const handleChange = (newValue: string) => {
      setInternalValue(newValue)
      const validationError = validateConfirmPassword(newValue)
      setError(validationError)
      onChange?.(newValue, validationError === '' && newValue !== '')
    }

    useEffect(() => {
      if (internalValue) {
        const validationError = validateConfirmPassword(internalValue)
        setError(validationError)
        onChange?.(internalValue, validationError === '')
      }
    }, [passwordValue])

    const currentValue = value !== undefined ? value : internalValue

    return (
      <div>
        <BasePasswordInput
          ref={ref}
          name={name}
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          label={label}
          required={required}
          error={error}
          disabled={disabled}
          showStrength={false}
        />
        
        {currentValue.length > 0 && !error && currentValue === passwordValue && (
          <div className="mt-3 p-3 bg-success/10 rounded-lg border border-success/20 animate-fade-in">
            <p className="text-sm text-success flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Passwords match
            </p>
          </div>
        )}
      </div>
    )
  }
)

ConfirmPasswordInput.displayName = 'ConfirmPasswordInput'