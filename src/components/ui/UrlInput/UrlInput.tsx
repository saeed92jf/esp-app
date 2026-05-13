'use client'

import { forwardRef, useState } from 'react'
import { Input, InputProps } from '@/components/ui/Input/Input'

export interface UrlInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  onChange?: (value: string, isValid: boolean) => void
}

export const UrlInput = forwardRef<HTMLInputElement, UrlInputProps>(
  ({ onChange, value: initialValue = '', ...props }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const [error, setError] = useState('')

    const validateUrl = (url: string): boolean => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      
      if (newValue === '') {
        setError('')
        onChange?.(newValue, false)
        return
      }
      
      const isValid = validateUrl(newValue)
      setError(isValid ? '' : 'Please enter a valid URL (e.g., https://example.com)')
      onChange?.(newValue, isValid)
    }

    return (
      <Input
        ref={ref}
        type="url"
        value={value}
        onChange={handleChange}
        error={error}
        {...props}
      />
    )
  }
)

UrlInput.displayName = 'UrlInput'