// components/ui/NumberInput.tsx
'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input, InputProps } from '@/components/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'

// ============================================
// NUMBER INPUT COMPONENT
// Enhanced number input with increment/decrement buttons and validation
// Wraps the base Input component with number-specific logic
// Uses Tailwind CSS only - inherits styles from Input component
// ============================================

export interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange' | 'value'> {
  /** Current numeric value */
  value?: number
  
  /** Minimum allowed value */
  min?: number
  
  /** Maximum allowed value */
  max?: number
  
  /** Step increment/decrement value */
  step?: number
  
  /** Callback when value changes */
  onChange?: (value: number, isValid: boolean) => void
  
  /** Whether to show increment/decrement buttons */
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

    /**
     * Validates number against min and max constraints
     * @returns true if valid, false otherwise
     */
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
      <div className="flex flex-col gap-1.5">
        {showButtons ? (
          <div className="relative">
            <Input
              ref={ref}
              type="number"
              value={currentValue}
              onChange={handleChange}
              error={displayError}
              className={cn(
                'text-center',
                // Hide native number input spinners
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                className
              )}
              {...props}
            />
            
            {/* Custom increment/decrement buttons */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
              <button
                type="button"
                onClick={increment}
                disabled={currentValue >= max}
                className="px-1.5 py-0.5 text-xs text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase value"
              >
                <FontAwesomeIcon icon={faChevronUp} className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={decrement}
                disabled={currentValue <= min}
                className="px-1.5 py-0.5 text-xs text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease value"
              >
                <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5" />
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
            className={cn(
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              className
            )}
            {...props}
          />
        )}
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'