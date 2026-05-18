// components/ui/Input.tsx
'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  warning?: string
  success?: string
  info?: string
  required?: boolean
  inputSize?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'gray' | 'white'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
  state?: 'default' | 'error' | 'warning' | 'success' | 'info'
}

// Radius mappings
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

// Border color mappings (non-state mode)
const borderColorClasses: Record<string, string> = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  danger: 'border-danger',
  success: 'border-success',
  warning: 'border-warning',
  info: 'border-info',
  gray: 'border-gray-300',
  white: 'border-white',
}

// Variant styles
const variantClasses: Record<string, string> = {
  default: 'bg-primary',
  filled: 'bg-input border-transparent focus:bg-primary',
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

// ============ STATE STYLES ============

// 1. DEFAULT STATE (Primary)
const defaultStateClasses = {
  border: 'border-light',
  focus: 'focus:border-focus focus:shadow-[0_0_0_3px_var(--border-focus)] focus:outline-none',
  hover: 'hover:border-primary/50',
  label: 'text-secondary',
  message: 'text-primary',
}

// 2. ERROR STATE
const errorStateClasses = {
  border: 'border-error',
  focus: 'focus:border-error focus:shadow-[0_0_0_3px_var(--border-error)] focus:outline-none',
  hover: 'hover:border-error/70',
  label: 'text-error',
  message: 'text-error',
}

// 3. WARNING STATE
const warningStateClasses = {
  border: 'border-warning',
  focus: 'focus:border-warning focus:shadow-[0_0_0_3px_var(--border-warning)] focus:outline-none',
  hover: 'hover:border-warning/70',
  label: 'text-warning',
  message: 'text-warning',
}

// 4. SUCCESS STATE
const successStateClasses = {
  border: 'border-success',
  focus: 'focus:border-success focus:shadow-[0_0_0_3px_var(--border-success)] focus:outline-none',
  hover: 'hover:border-success/70',
  label: 'text-success',
  message: 'text-success',
}

// 5. INFO STATE
const infoStateClasses = {
  border: 'border-info',
  focus: 'focus:border-info focus:shadow-[0_0_0_3px_var(--border-info)] focus:outline-none',
  hover: 'hover:border-info/70',
  label: 'text-info',
  message: 'text-info',
}

// Get state classes based on state prop or error/warning/success/info props
const getStateClasses = (state?: string, error?: string, warning?: string, success?: string, info?: string) => {
  if (error) return errorStateClasses
  if (warning) return warningStateClasses
  if (success) return successStateClasses
  if (info) return infoStateClasses
  if (state === 'error') return errorStateClasses
  if (state === 'warning') return warningStateClasses
  if (state === 'success') return successStateClasses
  if (state === 'info') return infoStateClasses
  return defaultStateClasses
}

// Hover styles map for variants
const hoverClassesMap: Record<string, string> = {
  default: 'hover:border-primary/50',
  filled: 'hover:bg-secondary/10',
  flushed: 'hover:border-primary/50',
  unstyled: '',
}

const DEFAULT_VALUES = {
  inputSize: 'md' as const,
  radius: 'lg' as const,
  borderWidth: 'sm' as const,
  borderColor: 'primary' as const,
  shadow: 'none' as const,
  variant: 'default' as const,
  state: 'default' as const,
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    warning,
    success,
    info,
    required, 
    className, 
    id, 
    inputSize = DEFAULT_VALUES.inputSize,
    radius = DEFAULT_VALUES.radius,
    borderWidth = DEFAULT_VALUES.borderWidth,
    borderColor = DEFAULT_VALUES.borderColor,
    shadow = DEFAULT_VALUES.shadow,
    variant = DEFAULT_VALUES.variant,
    state = DEFAULT_VALUES.state,
    disabled,
    ...props 
  }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    
    // Get the appropriate state classes
    const stateClasses = getStateClasses(state, error, warning, success, info)
    
    // Get message text (priority: error > warning > success > info)
    const messageText = error || warning || success || info
    
    // Get message type for styling
    const messageType = error ? 'error' : warning ? 'warning' : success ? 'success' : info ? 'info' : null
    
    const inputClasses = cn(
      // Base styles
      'w-full transition-all duration-200 outline-none',
      'text-primary',
      'placeholder:text-placeholder',
      
      // Variant styles
      variantClasses[variant],
      
      // Size styles
      sizeClasses[inputSize],
      
      // Border radius
      radiusClasses[radius],
      
      // Border width
      borderWidthClasses[borderWidth],
      
      // Border color based on state
      variant !== 'flushed' && variant !== 'unstyled' && stateClasses.border,
      
      // For flushed variant
      variant === 'flushed' && `border-b ${stateClasses.border}`,
      
      // Shadow
      shadowClasses[shadow],
      
      // Focus styles based on state
      stateClasses.focus,
      
      // Hover styles based on variant
      hoverClassesMap[variant],
      
      // Additional hover based on state
      stateClasses.hover,
      
      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed bg-secondary/20 text-tertiary',
      
      className
    )
    
    const labelClasses = cn(
      'text-sm font-medium transition-colors duration-200',
      stateClasses.label,
      required && "after:content-['*'] after:ml-0.5 after:text-error"
    )
    
    const messageClasses = cn(
      'text-sm transition-colors duration-200 mt-1',
      messageType === 'error' && 'text-error',
      messageType === 'warning' && 'text-warning',
      messageType === 'success' && 'text-success',
      messageType === 'info' && 'text-info',
    )
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={messageText ? `${inputId}-message` : undefined}
          className={inputClasses}
          {...props}
        />
        
        {messageText && (
          <p id={`${inputId}-message`} className={messageClasses}>
            {messageText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'