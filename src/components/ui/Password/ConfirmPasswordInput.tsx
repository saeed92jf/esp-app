// components/ui/Password/ConfirmPasswordInput.tsx
'use client'

import { forwardRef, useState, useEffect } from 'react'
import { BasePasswordInput } from './BasePasswordInput'
import { cn } from '@/lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

// ============================================
// CONFIRM PASSWORD INPUT PROPS
// ============================================

export interface ConfirmPasswordInputProps {
  /** Input name attribute */
  name?: string
  /** Current confirm password value */
  value?: string
  /** Original password to compare against */
  passwordValue?: string
  /** Callback when value changes with validation status */
  onChange?: (value: string, isValid: boolean) => void
  /** Placeholder text */
  placeholder?: string
  /** Label text */
  label?: string
  /** Whether field is required */
  required?: boolean
  /** Whether input is disabled */
  disabled?: boolean
  /** Input size variant */
  inputSize?: 'sm' | 'md' | 'lg'
  /** Border radius variant */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  /** Additional CSS classes */
  className?: string
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
    inputSize = 'md',
    radius = 'lg',
    className,
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
    const isMatch = currentValue.length > 0 && !error && currentValue === passwordValue

    return (
      <div className={cn("flex flex-col gap-2", className)}>
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
          inputSize={inputSize}
          radius={radius}
        />
        
        {isMatch && (
          <div className="mt-1 p-3 bg-success/10 rounded-lg border border-success/30 animate-fade-in">
            <p className="text-sm text-success flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
              Passwords match
            </p>
          </div>
        )}
      </div>
    )
  }
)

ConfirmPasswordInput.displayName = 'ConfirmPasswordInput'