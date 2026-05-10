'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Input, InputProps } from '@/components/ui/Input/Input'
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  error?: string
  required?: boolean
  showCount?: boolean
  maxLength?: number
  rows?: number
  
  // Input customization props (same as Input component)
  inputSize?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' | 'white'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
}

// Size classes (same as Input)
const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
}

// Radius mapping (same as Input)
const radiusMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

// Border width mapping (same as Input)
const borderWidthMap = {
  none: 'border-0',
  sm: 'border',
  md: 'border-2',
  lg: 'border-4',
}

// Border color mapping for normal state (same as Input)
const borderColorNormalMap = {
  primary: 'border-gray-300 dark:border-gray-600',
  secondary: 'border-gray-300 dark:border-gray-600',
  danger: 'border-gray-300 dark:border-gray-600',
  success: 'border-gray-300 dark:border-gray-600',
  warning: 'border-gray-300 dark:border-gray-600',
  gray: 'border-gray-300 dark:border-gray-600',
  white: 'border-white',
}

// Border color mapping for focus state (same as Input)
const borderColorFocusMap = {
  primary: 'focus:border-primary focus:ring-primary/20',
  secondary: 'focus:border-secondary focus:ring-secondary/20',
  danger: 'focus:border-danger focus:ring-danger/20',
  success: 'focus:border-success focus:ring-success/20',
  warning: 'focus:border-warning focus:ring-warning/20',
  gray: 'focus:border-gray-500 focus:ring-gray-500/20',
  white: 'focus:border-white focus:ring-white/20',
}

// Shadow mapping (same as Input)
const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
}

// Variant styles (same as Input)
const variantStyles = {
  default: 'bg-white dark:bg-gray-800',
  filled: 'bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700',
  flushed: 'border-b border-x-0 border-t-0 rounded-none px-0 bg-transparent',
  unstyled: 'border-none bg-transparent p-0 shadow-none focus:ring-0',
}

// Hover styles (same as Input)
const hoverStyles = {
  default: 'hover:border-gray-400 dark:hover:border-gray-500',
  filled: 'hover:bg-gray-200 dark:hover:bg-gray-700',
  flushed: 'hover:border-gray-400 dark:hover:border-gray-500',
  unstyled: '',
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    required, 
    className, 
    id, 
    showCount = false,
    maxLength,
    rows = 4,
    value: initialValue = '',
    onChange,
    // Input customization props with defaults
    inputSize = 'md',
    radius = 'lg',
    borderWidth = 'sm',
    borderColor = 'primary',
    shadow = 'none',
    variant = 'default',
    ...props 
  }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      onChange?.(e)
    }

    const currentLength = value.length
    const isNearLimit = maxLength && currentLength > maxLength * 0.8
    const isOverLimit = maxLength && currentLength > maxLength

    // Build class names (same as Input component)
    const textareaClasses = [
      // Base classes
      'w-full transition-all duration-200 outline-none',
      // Variant
      variantStyles[variant],
      // Size
      sizeClasses[inputSize],
      // Radius
      radiusMap[radius],
      // Border width
      borderWidthMap[borderWidth],
      // Normal border color
      borderColorNormalMap[borderColor],
      // Focus border color & ring
      !error && borderColorFocusMap[borderColor],
      // Hover effect
      !error && hoverStyles[variant],
      // Shadow
      shadowMap[shadow],
      // Error state
      error && 'border-danger focus:border-danger focus:ring-danger/20',
      // Disabled state
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Placeholder
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      // Textarea specific
      'resize-y min-h-[80px]',
      className,
    ].filter(Boolean).join(' ')

    return (
      <div className="form-group">
        {label && (
          <label 
            htmlFor={inputId} 
            className={`form-label ${required ? 'form-label-required' : ''}`}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={textareaClasses}
          {...props}
        />
        <div className="flex justify-between items-center">
          {error && <p className="form-error">{error}</p>}
          {showCount && maxLength && (
            <p className={cn(
              'text-xs ml-auto',
              isOverLimit ? 'text-danger' : isNearLimit ? 'text-warning' : 'text-gray-400'
            )}>
              {currentLength} / {maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'