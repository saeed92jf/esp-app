'use client'

import { forwardRef, useState } from 'react'
import { Input, InputProps } from '@/components/ui'
export interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange' | 'value'> {
  value?: number
  min?: number
  max?: number
  onChange?: (value: number, isValid: boolean) => void
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ onChange, value: initialValue = 0, min, max, ...props }, ref) => {
    const [value, setValue] = useState(initialValue)
    const [error, setError] = useState<string>('')

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
      const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value)
      setValue(newValue)
      const isValid = validateNumber(newValue)
      onChange?.(newValue, isValid)
    }

    const increment = () => {
      const newValue = value + 1
      if (max === undefined || newValue <= max) {
        setValue(newValue)
        const isValid = validateNumber(newValue)
        onChange?.(newValue, isValid)
      }
    }

    const decrement = () => {
      const newValue = value - 1
      if (min === undefined || newValue >= min) {
        setValue(newValue)
        const isValid = validateNumber(newValue)
        onChange?.(newValue, isValid)
      }
    }

    return (
      <div className="relative">
        <div className="flex">
          <button
            type="button"
            onClick={decrement}
            className="px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100"
          >
            -
          </button>
          <Input
            ref={ref}
            type="number"
            value={value}
            onChange={handleChange}
            className="rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            error={error}
            {...props}
          />
          <button
            type="button"
            onClick={increment}
            className="px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'