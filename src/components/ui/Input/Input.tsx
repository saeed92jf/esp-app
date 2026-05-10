'use client'

import { forwardRef } from 'react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  required?: boolean
  
  // Size options
  inputSize?: 'sm' | 'md' | 'lg'
  
  // Border radius options
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  
  // Border width options
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  
  // Border color options
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' | 'white'
  
  // Shadow options
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  // Variant options
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
}

// ============================================
// Radius mapping
// ============================================
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

// ============================================
// Border width mapping
// ============================================
const borderWidthMap = {
  none: 'border-0',
  sm: 'border',
  md: 'border-2',
  lg: 'border-4',
}

// ============================================
// Normal border color - Full dark mode support
// ============================================
const borderColorNormalMap = {
  primary: 'border-gray-200 dark:border-gray-700',
  secondary: 'border-gray-200 dark:border-gray-700',
  danger: 'border-gray-200 dark:border-gray-700',
  success: 'border-gray-200 dark:border-gray-700',
  warning: 'border-gray-200 dark:border-gray-700',
  gray: 'border-gray-200 dark:border-gray-700',
  white: 'border-gray-200 dark:border-gray-700',
}

// ============================================
// Text color mapping - CRITICAL FIX for dark mode text visibility
// ============================================
const textColorMap = {
  default: 'text-gray-900 dark:text-white',
  filled: 'text-gray-900 dark:text-white',
  flushed: 'text-gray-900 dark:text-white',
  unstyled: 'text-gray-900 dark:text-white',
}

// ============================================
// Focus border color - Full dark mode support
// ============================================
const borderColorFocusMap = {
  primary: 'focus:border-primary focus:ring-primary/20 dark:focus:ring-primary/30',
  secondary: 'focus:border-secondary focus:ring-secondary/20 dark:focus:ring-secondary/30',
  danger: 'focus:border-danger focus:ring-danger/20 dark:focus:ring-danger/30',
  success: 'focus:border-success focus:ring-success/20 dark:focus:ring-success/30',
  warning: 'focus:border-warning focus:ring-warning/20 dark:focus:ring-warning/30',
  gray: 'focus:border-gray-500 focus:ring-gray-500/20 dark:focus:ring-gray-500/30',
  white: 'focus:border-white focus:ring-white/20 dark:focus:ring-white/30',
}

// ============================================
// Shadow mapping
// ============================================
const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
}

// ============================================
// Variant styles - Full dark mode support
// ============================================
const variantStyles = {
  default: 'bg-white dark:bg-gray-900',
  filled: 'bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700',
  flushed: 'border-b border-x-0 border-t-0 rounded-none px-0 bg-transparent',
  unstyled: 'border-none bg-transparent p-0 shadow-none focus:ring-0',
}

// ============================================
// Hover styles - Full dark mode support
// ============================================
const hoverStyles = {
  default: 'hover:border-primary/40 dark:hover:border-primary/50',
  filled: 'hover:bg-gray-100 dark:hover:bg-gray-700',
  flushed: 'hover:border-primary/40 dark:hover:border-primary/50',
  unstyled: '',
}

// ============================================
// Size styles
// ============================================
const inputSizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
}

// ============================================
// Disabled styles - Full dark mode support
// ============================================
const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-500'

// ============================================
// Placeholder styles - Full dark mode support
// ============================================
const placeholderStyles = 'placeholder:text-gray-400 dark:placeholder:text-gray-500'

// ============================================
// Default values configuration
// ============================================
const DEFAULT_VALUES = {
  inputSize: 'md' as const,
  radius: 'lg' as const,
  borderWidth: 'sm' as const,
  borderColor: 'primary' as const,
  shadow: 'none' as const,
  variant: 'default' as const,
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    required, 
    className, 
    id, 
    inputSize = DEFAULT_VALUES.inputSize,
    radius = DEFAULT_VALUES.radius,
    borderWidth = DEFAULT_VALUES.borderWidth,
    borderColor = DEFAULT_VALUES.borderColor,
    shadow = DEFAULT_VALUES.shadow,
    variant = DEFAULT_VALUES.variant,
    disabled,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    // Build class names
    const inputClasses = [
      // Base classes
      'w-full transition-all duration-200 outline-none',
      // Text color - CRITICAL FIX: ensures text is white in dark mode
      textColorMap[variant],
      // Variant
      variantStyles[variant],
      // Size
      inputSizeStyles[inputSize],
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
      error && 'border-danger focus:border-danger focus:ring-danger/20 dark:focus:ring-danger/30',
      // Hover error state
      error && 'hover:border-danger/70',
      // Disabled state
      disabledStyles,
      // Placeholder
      placeholderStyles,
      className,
    ].filter(Boolean).join(' ')
    
    return (
      <div className="form-group">
        {label && (
          <label 
            htmlFor={inputId} 
            className={`form-label ${required ? 'form-label-required' : ''} dark:text-gray-400`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        {error && <p className="form-error dark:text-danger-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'