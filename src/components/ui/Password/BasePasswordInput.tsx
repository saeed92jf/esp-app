// components/ui/BasePasswordInput.tsx
'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

// ============================================
// BASE PASSWORD INPUT COMPONENT
// Password input with show/hide toggle and optional strength meter
// Wraps the base Input component with password-specific logic
// Uses Tailwind CSS only - inherits styles from Input component
// ============================================

export interface BasePasswordInputProps {
  /** Input name attribute */
  name?: string
  
  /** Current password value */
  value?: string
  
  /** Callback when value changes */
  onChange?: (value: string) => void
  
  /** Placeholder text */
  placeholder?: string
  
  /** Label text above the input */
  label?: string
  
  /** Whether the field is required */
  required?: boolean
  
  /** Error message to display */
  error?: string
  
  /** Additional CSS classes */
  className?: string
  
  /** Whether the input is disabled */
  disabled?: boolean
  
  /** Whether to show password strength meter */
  showStrength?: boolean
  
  /** External strength value (0-5) */
  strength?: number
  
  /** Size of the input */
  inputSize?: 'sm' | 'md' | 'lg'
  
  /** Border radius of the input */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  
  /** Border width of the input */
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  
  /** Border color variant */
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' | 'white'
  
  /** Shadow size of the input */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  /** Visual style variant */
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
}

export const BasePasswordInput = forwardRef<HTMLInputElement, BasePasswordInputProps>(
  ({ 
    name,
    value,
    onChange,
    placeholder = '••••••',
    label,
    required = false,
    error: externalError,
    className = '',
    disabled = false,
    showStrength = false,
    strength: externalStrength,
    inputSize = 'md',
    radius = 'lg',
    borderWidth = 'sm',
    borderColor = 'primary',
    shadow = 'none',
    variant = 'default',
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [internalValue, setInternalValue] = useState(value || '')
    const [internalStrength, setInternalStrength] = useState(0)

    /**
     * Calculate password strength score (0-5)
     * Based on length, uppercase, numbers, and special characters
     */
    const calculateStrength = (password: string): number => {
      let score = 0
      if (password.length >= 8) score++
      if (password.length >= 12) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
      return Math.min(score, 5)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      setInternalStrength(calculateStrength(newValue))
      onChange?.(newValue)
    }

    const toggleShowPassword = () => setShowPassword(!showPassword)

    const currentValue = value !== undefined ? value : internalValue
    const currentStrength = externalStrength !== undefined ? externalStrength : internalStrength
    const displayError = externalError

    const getStrengthText = (score: number) => {
      if (score <= 2) return 'Weak'
      if (score <= 4) return 'Medium'
      return 'Strong'
    }

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label 
            htmlFor={name}
            className={cn(
              'text-sm font-medium text-secondary',
              required && "after:content-['*'] after:ml-0.5 after:text-error"
            )}
          >
            {label}
          </label>
        )}
        
        {/* Input with eye toggle button */}
        <div className="relative">
          <Input
            ref={ref}
            name={name}
            type={showPassword ? 'text' : 'password'}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            error={displayError}
            inputSize={inputSize}
            radius={radius}
            borderWidth={borderWidth}
            borderColor={borderColor}
            shadow={shadow}
            variant={variant}
            className={cn('pr-10', className)}
          />
          
          {/* Show/hide password toggle button */}
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors focus:outline-none z-10"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <FontAwesomeIcon 
              icon={showPassword ? faEyeSlash : faEye} 
              className="w-5 h-5" 
            />
          </button>
        </div>

        {/* Error message */}
        {displayError && (
          <p className="text-sm text-error">{displayError}</p>
        )}

        {/* Password strength meter */}
        {showStrength && currentValue.length > 0 && !displayError && (
          <div className="mt-2">
            {/* Strength bar */}
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    level <= currentStrength 
                      ? currentStrength <= 2 
                        ? 'bg-error' 
                        : currentStrength <= 4 
                          ? 'bg-warning' 
                          : 'bg-success'
                      : 'bg-light'
                  )}
                />
              ))}
            </div>
            
            {/* Strength text */}
            <p className={cn(
              'text-xs',
              currentStrength <= 2 ? 'text-error' : 
              currentStrength <= 4 ? 'text-warning' : 
              'text-success'
            )}>
              Password strength: {getStrengthText(currentStrength)}
            </p>
          </div>
        )}
      </div>
    )
  }
)

BasePasswordInput.displayName = 'BasePasswordInput'