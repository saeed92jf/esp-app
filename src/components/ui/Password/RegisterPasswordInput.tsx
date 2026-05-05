'use client'

import { forwardRef, useState } from 'react'
import { BasePasswordInput } from './BasePasswordInput'
import { cn } from '@/lib/cn'

export interface RegisterPasswordInputProps {
  name?: string
  value?: string
  onChange?: (value: string, isValid?: boolean, strength?: number) => void
  placeholder?: string
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

export const RegisterPasswordInput = forwardRef<HTMLInputElement, RegisterPasswordInputProps>(
  ({ onChange, ...props }, ref) => {
    const [strength, setStrength] = useState(0)
    const [internalValue, setInternalValue] = useState('')
    const [isValid, setIsValid] = useState(false)

    const validatePassword = (password: string): string => {
      if (password.length < 6) {
        setIsValid(false)
        return 'Password must be at least 6 characters'
      }
      if (!/[A-Z]/.test(password)) {
        setIsValid(false)
        return 'Password must contain at least one uppercase letter'
      }
      if (!/[0-9]/.test(password)) {
        setIsValid(false)
        return 'Password must contain at least one number'
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setIsValid(false)
        return 'Password must contain at least one special character (!@#$%^&*)'
      }
      setIsValid(true)
      return ''
    }

    const handleChange = (value: string) => {
      setInternalValue(value)
      const newStrength = calculateStrength(value)
      setStrength(newStrength)
      const error = validatePassword(value)
      onChange?.(value, isValid, newStrength)
    }

    const calculateStrength = (password: string): number => {
      let score = 0
      if (password.length >= 8) score++
      if (password.length >= 12) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
      return Math.min(score, 5)
    }

    const getStrengthColor = () => {
      if (strength <= 2) return 'text-danger'
      if (strength <= 4) return 'text-warning'
      return 'text-success'
    }

    const requirements = [
      { text: 'At least 6 characters', met: internalValue.length >= 6 },
      { text: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(internalValue) },
      { text: 'At least one number (0-9)', met: /[0-9]/.test(internalValue) },
      { text: 'At least one special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(internalValue) },
    ]

    return (
      <div>
        <BasePasswordInput
          ref={ref}
          {...props}
          onChange={handleChange}
          showStrength={true}
          strength={strength}
        />
        
        {internalValue.length > 0 && !isValid && (
          <div className="form-hint-box mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Password must contain:
            </p>
            <ul className="space-y-1">
              {requirements.map((req, index) => (
                <li 
                  key={index} 
                  className={cn(
                    'text-xs flex items-center gap-2',
                    req.met ? 'text-success' : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  <span className={req.met ? 'text-success' : ''}>
                    {req.met ? '✓' : '○'}
                  </span>
                  {req.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {internalValue.length > 0 && isValid && (
          <div className="mt-3 p-3 bg-success/10 rounded-lg border border-success/20 animate-fade-in">
            <p className="text-sm text-success flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Strong password!
            </p>
          </div>
        )}
      </div>
    )
  }
)

RegisterPasswordInput.displayName = 'RegisterPasswordInput'