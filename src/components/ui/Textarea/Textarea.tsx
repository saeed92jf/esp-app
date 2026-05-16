// components/ui/Textarea.tsx
'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// TEXTAREA COMPONENT
// Multi-line text input with label, error handling, and character count
// Supports multiple variants, sizes, and custom styling
// Uses Tailwind CSS only - no separate CSS file needed
// ============================================

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Label text displayed above the textarea */
  label?: string
  
  /** Error message to display below the textarea */
  error?: string
  
  /** Whether the field is required (adds asterisk to label) */
  required?: boolean
  
  /** Whether to show character count (requires maxLength) */
  showCount?: boolean
  
  /** Maximum number of characters allowed */
  maxLength?: number
  
  /** Number of visible text rows */
  rows?: number
  
  /** Size of the textarea */
  inputSize?: 'sm' | 'md' | 'lg'
  
  /** Border radius of the textarea */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  
  /** Border width of the textarea */
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  
  /** Border color variant (affects focus color as well) */
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' | 'white'
  
  /** Shadow size of the textarea */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  /** Visual style variant of the textarea */
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
}

// ============================================
// SIZE CLASSES
// ============================================

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
}

// ============================================
// RADIUS CLASSES
// ============================================

const radiusClasses: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

// ============================================
// BORDER WIDTH CLASSES
// ============================================

const borderWidthClasses: Record<string, string> = {
  none: 'border-0',
  sm: 'border',
  md: 'border-2',
  lg: 'border-4',
}

// ============================================
// VARIANT STYLES
// ============================================

const variantClasses: Record<string, string> = {
  default: 'bg-primary',
  filled: 'bg-secondary border-transparent focus:bg-primary',
  flushed: 'border-b border-x-0 border-t-0 rounded-none px-0 bg-transparent',
  unstyled: 'border-none bg-transparent p-0 shadow-none focus:ring-0',
}

// ============================================
// FOCUS RING COLORS (based on borderColor)
// ============================================

const focusRingClasses: Record<string, string> = {
  primary: 'focus:border-focus focus:ring-ring focus:ring-1',
  secondary: 'focus:border-focus focus:ring-ring focus:ring-1',
  danger: 'focus:border-error focus:ring-error/20',
  success: 'focus:border-success focus:ring-success/20',
  warning: 'focus:border-warning focus:ring-warning/20',
  gray: 'focus:border-medium focus:ring-medium/20',
  white: 'focus:border-white focus:ring-white/20',
}

// ============================================
// HOVER STYLES
// ============================================

const hoverClasses: Record<string, string> = {
  default: 'hover:border-focus/50',
  filled: 'hover:bg-tertiary',
  flushed: 'hover:border-focus/50',
  unstyled: '',
}

// ============================================
// SHADOW CLASSES
// ============================================

const shadowClasses: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
}

const DEFAULT_VALUES = {
  inputSize: 'md' as const,
  radius: 'lg' as const,
  borderWidth: 'sm' as const,
  borderColor: 'primary' as const,
  shadow: 'none' as const,
  variant: 'default' as const,
  rows: 4,
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
    rows = DEFAULT_VALUES.rows,
    value: initialValue = '',
    onChange,
    inputSize = DEFAULT_VALUES.inputSize,
    radius = DEFAULT_VALUES.radius,
    borderWidth = DEFAULT_VALUES.borderWidth,
    borderColor = DEFAULT_VALUES.borderColor,
    shadow = DEFAULT_VALUES.shadow,
    variant = DEFAULT_VALUES.variant,
    disabled,
    ...props 
  }, ref) => {
    const [value, setValue] = useState(initialValue as string)
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      onChange?.(e)
    }

    const currentLength = value.length
    const isNearLimit = maxLength ? currentLength > maxLength * 0.8 : false
    const isOverLimit = maxLength ? currentLength > maxLength : false

    // Base textarea classes
    const textareaClasses = cn(
      // Base styles
      'w-full transition-all duration-200 outline-none',
      'placeholder:text-tertiary',
      'resize-y min-h-[80px]',
      
      // Variant styles
      variantClasses[variant],
      
      // Size styles
      sizeClasses[inputSize],
      
      // Border radius
      radiusClasses[radius],
      
      // Border width
      borderWidthClasses[borderWidth],
      
      // Border color - default light border
      'border-light',
      
      // Shadow
      shadowClasses[shadow],
      
      // Focus styles
      !error && focusRingClasses[borderColor],
      
      // Hover styles
      !error && hoverClasses[variant],
      
      // Error state
      error && 'border-error focus:border-error focus:ring-error/20',
      
      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed',
      
      className
    )

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId} 
            className={cn(
              'text-sm font-medium text-secondary',
              required && "after:content-['*'] after:ml-0.5 after:text-error"
            )}
          >
            {label}
          </label>
        )}
        
        {/* Textarea field */}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          disabled={disabled}
          className={textareaClasses}
          {...props}
        />
        
        {/* Error message and character count */}
        <div className="flex justify-between items-center gap-2">
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
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