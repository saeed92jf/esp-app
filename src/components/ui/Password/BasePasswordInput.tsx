'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Input } from '@/components/ui/Input/Input'

export interface BasePasswordInputProps {
  name?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  error?: string
  className?: string
  disabled?: boolean
  showStrength?: boolean
  strength?: number
  
  // Input customization props
  inputSize?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' | 'white'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
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
    // Input customization defaults
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

    const getStrengthColor = (score: number) => {
      if (score <= 2) return 'bg-danger text-danger'
      if (score <= 4) return 'bg-warning text-warning'
      return 'bg-success text-success'
    }

    const getStrengthText = (score: number) => {
      if (score <= 2) return 'Weak'
      if (score <= 4) return 'Medium'
      return 'Strong'
    }

    return (
      <div className="form-group">
        {label && (
          <label 
            htmlFor={name}
            className={`form-label ${required ? 'form-label-required' : ''}`}
          >
            {label}
          </label>
        )}
        
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
            // Pass through customization props
            inputSize={inputSize}
            radius={radius}
            borderWidth={borderWidth}
            borderColor={borderColor}
            shadow={shadow}
            variant={variant}
            className={`pr-10 ${className}`}
          />
          
          {/* Eye button */}
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none z-10"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {displayError && <p className="form-error">{displayError}</p>}

        {/* Strength meter */}
        {showStrength && currentValue.length > 0 && !displayError && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    level <= currentStrength 
                      ? currentStrength <= 2 
                        ? 'bg-danger' 
                        : currentStrength <= 4 
                          ? 'bg-warning' 
                          : 'bg-success'
                      : 'bg-gray-200 dark:bg-gray-600'
                  )}
                />
              ))}
            </div>
            <p className={cn(
              'text-xs',
              currentStrength <= 2 ? 'text-danger' : currentStrength <= 4 ? 'text-warning' : 'text-success'
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