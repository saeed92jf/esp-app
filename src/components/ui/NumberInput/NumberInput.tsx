'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface NumberInputProps {
  name?: string
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number, isValid: boolean) => void
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ 
    name,
    value: externalValue,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    label,
    required = false,
    error: externalError,
    disabled = false,
  }, ref) => {
    const [internalValue, setInternalValue] = useState(externalValue || 0)
    const [internalError, setInternalError] = useState('')

    const validateNumber = (num: number): boolean => {
      if (num < min) {
        setInternalError(`Minimum value is ${min}`)
        return false
      }
      if (num > max) {
        setInternalError(`Maximum value is ${max}`)
        return false
      }
      setInternalError('')
      return true
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value === '' ? 0 : Number(e.target.value)
      setInternalValue(newValue)
      const isValid = validateNumber(newValue)
      onChange?.(newValue, isValid)
    }

    const increment = () => {
      if (disabled) return
      const newValue = internalValue + step
      if (max === undefined || newValue <= max) {
        setInternalValue(newValue)
        const isValid = validateNumber(newValue)
        onChange?.(newValue, isValid)
      }
    }

    const decrement = () => {
      if (disabled) return
      const newValue = internalValue - step
      if (min === undefined || newValue >= min) {
        setInternalValue(newValue)
        const isValid = validateNumber(newValue)
        onChange?.(newValue, isValid)
      }
    }

    const currentValue = externalValue !== undefined ? externalValue : internalValue
    const displayError = externalError || internalError
    const inputId = name || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
              required && "after:content-['*'] after:text-danger after:ml-1"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="flex items-center">
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || currentValue <= min}
            className={cn(
              'px-3 py-2 border border-r-0 rounded-l-md',
              'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600',
              'text-gray-700 dark:text-gray-300 font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            −
          </button>
          
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="number"
            value={currentValue}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              'w-full px-3 py-2 text-center border',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              displayError 
                ? 'border-danger focus:border-danger focus:ring-danger/30' 
                : 'border-gray-300 dark:border-gray-600',
              'flex-1'
            )}
          />
          
          <button
            type="button"
            onClick={increment}
            disabled={disabled || currentValue >= max}
            className={cn(
              'px-3 py-2 border border-l-0 rounded-r-md',
              'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600',
              'text-gray-700 dark:text-gray-300 font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            +
          </button>
        </div>

        {displayError && (
          <p className="mt-1 text-sm text-danger">{displayError}</p>
        )}
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'