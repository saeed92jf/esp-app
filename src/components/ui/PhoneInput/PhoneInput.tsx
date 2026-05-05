'use client'

import { forwardRef, useState } from 'react'
import { Input, InputProps } from '../Input/Input'

export interface PhoneInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  onChange?: (value: string, isValid: boolean) => void
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, value: initialValue = '', ...props }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const [error, setError] = useState('')

    const validatePhone = (phone: string): boolean => {
      const digits = phone.replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 15
    }

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
      
      if (formattedValue === '') {
        setError('')
        onChange?.(formattedValue, false)
        return
      }
      
      const isValid = validatePhone(formattedValue)
      setError(isValid ? '' : 'Please enter a valid phone number')
      onChange?.(formattedValue, isValid)
    }

    return (
      <Input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder="(555) 555-5555"
        error={error}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'