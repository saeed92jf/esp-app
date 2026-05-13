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
  
  inputSize?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' | 'white'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
}

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

const borderWidthMap = {
  none: 'border-0',
  sm: 'border',
  md: 'border-2',
  lg: 'border-4',
}

const borderColorNormalMap = {
  primary: 'border-light',
  secondary: 'border-light',
  danger: 'border-light',
  success: 'border-light',
  warning: 'border-light',
  gray: 'border-light',
  white: 'border-light',
}

const borderColorFocusMap = {
  primary: 'focus:border-focus focus:ring-ring focus:ring-1',
  secondary: 'focus:border-focus focus:ring-ring focus:ring-1',
  danger: 'focus:border-error focus:ring-error/20',
  success: 'focus:border-success focus:ring-success/20',
  warning: 'focus:border-warning focus:ring-warning/20',
  gray: 'focus:border-medium focus:ring-medium/20',
  white: 'focus:border-white focus:ring-white/20',
}

const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
}

const variantStyles = {
  default: 'bg-primary',
  filled: 'bg-secondary border-transparent focus:bg-primary',
  flushed: 'border-b border-x-0 border-t-0 rounded-none px-0 bg-transparent',
  unstyled: 'border-none bg-transparent p-0 shadow-none focus:ring-0',
}

const hoverStyles = {
  default: 'hover:border-focus/50',
  filled: 'hover:bg-tertiary',
  flushed: 'hover:border-focus/50',
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

    const textareaClasses = [
      'w-full transition-all duration-200 outline-none',
      variantStyles[variant],
      sizeClasses[inputSize],
      radiusMap[radius],
      borderWidthMap[borderWidth],
      borderColorNormalMap[borderColor],
      !error && borderColorFocusMap[borderColor],
      !error && hoverStyles[variant],
      shadowMap[shadow],
      error && 'border-error focus:border-error focus:ring-error/20',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-tertiary',
      'resize-y min-h-[80px]',
      className,
    ].filter(Boolean).join(' ')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label 
            htmlFor={inputId} 
            className={`text-sm font-medium text-secondary ${required ? 'after:content-["*"] after:ml-0.5 after:text-error' : ''}`}
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
        <div className="flex justify-between items-center gap-2">
          {error && <p className="text-sm text-error">{error}</p>}
          {showCount && maxLength && (
            <p className={cn(
              'text-xs ml-auto',
              isOverLimit ? 'text-error' : isNearLimit ? 'text-warning' : 'text-tertiary'
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