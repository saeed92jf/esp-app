'use client'

import { forwardRef, useState } from 'react'
import { Input, InputProps } from '@/components/ui/Input/Input'
export interface EmailInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  onChange?: (value: string, isValid: boolean) => void
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ onChange, value: initialValue = '', ...props }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const [error, setError] = useState('')

    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
      return emailRegex.test(email)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      
      if (newValue === '') {
        setError('')
        onChange?.(newValue, false)
        return
      }
      
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
        {...props}
      />
    )
  }
)

EmailInput.displayName = 'EmailInput'