// components/ui/Input.tsx
'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// INPUT COMPONENT
// A fully customizable input field with label, error, and variants
// Uses Tailwind CSS only - no separate CSS file needed
// ============================================

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string
  
  /** Error message to display below the input */
  error?: string
  
  /** Whether the field is required (adds asterisk to label) */
  required?: boolean
  
  /** Size of the input field */
  inputSize?: 'sm' | 'md' | 'lg'
  
  /** Border radius of the input */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  
  /** Border width of the input */
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  
  /** Border color variant (affects focus color as well) */
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' | 'white'
  
  /** Shadow size of the input */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  /** Visual style variant of the input */
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
}

// ============================================
// STYLE MAPPINGS
// Using semantic Tailwind classes
// ============================================

// Border radius mappings - using standard Tailwind rounded classes
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

// Border width mappings
const borderWidthClasses: Record<string, string> = {
  none: 'border-0',
  sm: 'border',
  md: 'border-2',
  lg: 'border-4',
}

// Variant styles
const variantClasses: Record<string, string> = {
  default: 'bg-primary',
  filled: 'bg-secondary border-transparent focus:bg-primary',
  flushed: 'border-b border-x-0 border-t-0 rounded-none px-0 bg-transparent',
  unstyled: 'border-none bg-transparent p-0 shadow-none focus:ring-0',
}

// Size styles
const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
}

// Shadow styles
const shadowClasses: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
}

// Focus ring colors based on borderColor
const focusRingClasses: Record<string, string> = {
  primary: 'focus:ring-primary focus:border-focus',
  secondary: 'focus:ring-secondary focus:border-focus',
  danger: 'focus:ring-error focus:border-error',
  success: 'focus:ring-success focus:border-success',
  warning: 'focus:ring-warning focus:border-warning',
  gray: 'focus:ring-gray-500 focus:border-medium',
  white: 'focus:ring-white focus:border-white',
}

// Hover styles
const hoverClasses: Record<string, string> = {
  default: 'hover:border-focus/50',
  filled: 'hover:bg-tertiary',
  flushed: 'hover:border-focus/50',
  unstyled: '',
}

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
    
    // Base input classes
    const inputClasses = cn(
      // Base styles
      'w-full transition-all duration-200 outline-none',
      'text-primary',
      'placeholder:text-tertiary',
      
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
      !error && 'focus:ring-2 focus:ring-offset-0',
      
      // Hover styles
      !error && hoverClasses[variant],
      
      // Error state
      error && 'border-error focus:border-error focus:ring-error/20',
      error && 'hover:border-error/70',
      
      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed bg-tertiary text-tertiary',
      
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
        
        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'