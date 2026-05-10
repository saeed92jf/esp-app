'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Input, InputProps } from '@/components/ui/Input/Input'
export interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange' | 'value'> {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number, isValid: boolean) => void
  showButtons?: boolean
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ 
    onChange, 
    value: externalValue, 
    min = 0,
    max = 100,
    step = 1,
    showButtons = true,
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(externalValue || 0)
    const [error, setError] = useState('')

    const validateNumber = (num: number): boolean => {
      if (min !== undefined && num < min) {
        setError(`Minimum value is ${min}`)
        return false
      }
      if (max !== undefined && num > max) {
        setError(`Maximum value is ${max}`)
        return false
      }
      setError('')
      return true
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value === '' ? 0 : Number(e.target.value)
      setInternalValue(newValue)
      const isValid = validateNumber(newValue)
      onChange?.(newValue, isValid)
    }

    const increment = () => {
      const newValue = internalValue + step
      if (max === undefined || newValue <= max) {
        setInternalValue(newValue)
        const isValid = validateNumber(newValue)
        onChange?.(newValue, isValid)
      }
    }

    const decrement = () => {
      const newValue = internalValue - step
      if (min === undefined || newValue >= min) {
        setInternalValue(newValue)
        const isValid = validateNumber(newValue)
        onChange?.(newValue, isValid)
      }
    }

    const currentValue = externalValue !== undefined ? externalValue : internalValue
    const displayError = props.error || error

    return (
      <div className="space-y-1">
        {showButtons ? (
          <div className="relative">
            <Input
              ref={ref}
              type="number"
              value={currentValue}
              onChange={handleChange}
              error={displayError}
              className={cn('text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none', className)}
              {...props}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
              <button
                type="button"
                onClick={increment}
                disabled={currentValue >= max}
                className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={decrement}
                disabled={currentValue <= min}
                className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                ▼
              </button>
            </div>
          </div>
        ) : (
          <Input
            ref={ref}
            type="number"
            value={currentValue}
            onChange={handleChange}
            error={displayError}
            className={cn('[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none', className)}
            {...props}
          />
        )}
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'