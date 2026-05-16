// components/ui/Password/RegisterPasswordInput.tsx
'use client'

import { forwardRef, useState } from 'react'
import { BasePasswordInput } from './BasePasswordInput'
import { cn } from '@/lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

// ============================================
// REGISTER PASSWORD INPUT PROPS
// ============================================

export interface RegisterPasswordInputProps {
  /** Input name attribute */
  name?: string
  /** Current password value */
  value?: string
  /** Callback when value changes */
  onChange?: (value: string, isValid?: boolean, strength?: number) => void
  /** Placeholder text */
  placeholder?: string
  /** Label text */
  label?: string
  /** Whether field is required */
  required?: boolean
  /** External error message */
  error?: string
  /** Whether input is disabled */
  disabled?: boolean
  /** Input size variant */
  inputSize?: 'sm' | 'md' | 'lg'
  /** Border radius variant */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  /** Additional CSS classes */
  className?: string
}

export const RegisterPasswordInput = forwardRef<HTMLInputElement, RegisterPasswordInputProps>(
  ({ 
    onChange, 
    inputSize = 'md', 
    radius = 'lg', 
    className,
    ...props 
  }, ref) => {
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
      validatePassword(value)
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

    const requirements = [
      { text: 'At least 6 characters', met: internalValue.length >= 6 },
      { text: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(internalValue) },
      { text: 'At least one number (0-9)', met: /[0-9]/.test(internalValue) },
      { text: 'At least one special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(internalValue) },
    ]

    const allRequirementsMet = requirements.every(req => req.met)

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <BasePasswordInput
          ref={ref}
          {...props}
          onChange={handleChange}
          showStrength={true}
          strength={strength}
          inputSize={inputSize}
          radius={radius}
        />
        
        {internalValue.length > 0 && !allRequirementsMet && (
          <div className="mt-1 p-3 bg-secondary rounded-lg border border-light">
            <p className="text-xs font-medium text-secondary mb-2">
              Password must contain:
            </p>
            <ul className="space-y-1">
              {requirements.map((req, index) => (
                <li 
                  key={index} 
                  className={cn(
                    'text-xs flex items-center gap-2',
                    req.met ? 'text-success' : 'text-tertiary'
                  )}
                >
                  <span className={req.met ? 'text-success' : 'text-tertiary'}>
                    {req.met ? '✓' : '○'}
                  </span>
                  {req.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {internalValue.length > 0 && isValid && allRequirementsMet && (
          <div className="mt-1 p-3 bg-success/10 rounded-lg border border-success/30 animate-fade-in">
            <p className="text-sm text-success flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
              Strong password!
            </p>
          </div>
        )}
      </div>
    )
  }
)

RegisterPasswordInput.displayName = 'RegisterPasswordInput'