'use client'

import { forwardRef, useState } from 'react'
import { Input, InputProps } from '@/components/ui'
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  onChange?: (value: string, isValid: boolean) => void
  showStrength?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ onChange, showStrength = true, value: initialValue = '', ...props }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const [error, setError] = useState<string>('')
    const [showPassword, setShowPassword] = useState(false)
    const [strength, setStrength] = useState(0)

    const validatePassword = (password: string): { isValid: boolean; message: string; strength: number } => {
      if (password === '') {
        return { isValid: false, message: '', strength: 0 }
      }
      
      let score = 0
      if (password.length >= 8) score++
      if (password.length >= 12) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
      
      if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters', strength: score }
      }
      if (score < 3) {
        return { isValid: false, message: 'Password is too weak', strength: score }
      }
      return { isValid: true, message: '', strength: score }
    }

    const getStrengthColor = () => {
      if (strength <= 2) return 'bg-red-500'
      if (strength <= 3) return 'bg-yellow-500'
      return 'bg-green-500'
    }

    const getStrengthText = () => {
      if (strength <= 2) return 'Weak'
      if (strength <= 3) return 'Medium'
      return 'Strong'
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      
      const { isValid, message, strength: newStrength } = validatePassword(newValue)
      setError(message)
      setStrength(newStrength)
      onChange?.(newValue, isValid)
    }

    return (
      <div>
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={handleChange}
            error={error}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        
        {showStrength && value.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    level <= strength ? getStrengthColor() : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password strength: <span className="font-medium">{getStrengthText()}</span>
            </p>
          </div>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'