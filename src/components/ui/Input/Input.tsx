'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  warning?: string
  success?: string
  info?: string
  required?: boolean
  inputSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'gray' | 'white'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
  state?: 'default' | 'error' | 'warning' | 'success' | 'info'
  isOpen?: boolean  // برای چسبیدن dropdown به input
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

// Variant styles
const variantClasses: Record<string, string> = {
  default: 'bg-primary',
  filled: 'bg-input border-transparent focus:bg-primary',
  flushed: 'border-b border-x-0 border-t-0 rounded-none px-0 bg-transparent',
  unstyled: 'border-none bg-transparent p-0 shadow-none focus:ring-0',
}

// Size styles
const sizeClasses: Record<string, string> = {
  xs: 'h-8 px-2.5 text-xs',
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  xl: 'h-14 px-6 text-lg',
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
  focus: 'focus:border-focus focus:shadow-[0_0_3px_0_var(--border-focus)] focus:outline-none',
  hover: 'hover:border-primary/50',
  label: 'text-secondary',
  messageBg: 'bg-primary',
  messageText: 'text-primary',
}

// 2. ERROR STATE
const errorStateClasses = {
  border: 'border-error',
  focus: 'focus:border-error focus:shadow-[0_0_3px_0_var(--border-error)] focus:outline-none',
  hover: 'hover:border-error/70',
  label: 'text-error',
  messageBg: 'bg-red-200',
  messageText: 'text-red-800',
}

// 3. WARNING STATE
const warningStateClasses = {
  border: 'border-warning',
  focus: 'focus:border-warning focus:shadow-[0_0_3px_0_var(--border-warning)] focus:outline-none',
  hover: 'hover:border-warning/70',
  label: 'text-warning',
  messageBg: 'bg-warning/10',
  messageText: 'text-warning',
}

// 4. SUCCESS STATE
const successStateClasses = {
  border: 'border-success',
  focus: 'focus:border-success focus:shadow-[0_0_3px_0_var(--border-success)] focus:outline-none',
  hover: 'hover:border-success/70',
  label: 'text-success',
  messageBg: 'bg-success/10',
  messageText: 'text-success',
}

// 5. INFO STATE
const infoStateClasses = {
  border: 'border-info',
  focus: 'focus:border-info focus:shadow-[0_0_3px_0_var(--border-info)] focus:outline-none',
  hover: 'hover:border-info/70',
  label: 'text-info',
  messageBg: 'bg-info/10',
  messageText: 'text-info',
}

// Get state classes based on state prop
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
    isOpen = false,
    disabled,
    ...props 
  }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const [isFocused, setIsFocused] = useState(false)
    
    const stateClasses = getStateClasses(state, error, warning, success, info)
    
    const messageText = error || warning || success || info
    
    // تعیین borderRadius بر اساس isOpen (برای چسبیدن dropdown به input)
    const getBorderRadius = () => {
      if (isOpen) {
        return 'rounded-t-3xl rounded-b-none'
      }
      return radiusClasses[radius]
    }
    
    // تعیین focus styles برای حالت باز
    const getFocusStyles = () => {
      if (isOpen) {
        // در حالت باز، فوکوس نباید روی border پایین تأثیر بگذارد
        return 'focus:outline-none'
      }
      return stateClasses.focus
    }
    
    const inputClasses = cn(
      'w-full transition-all duration-200 outline-none box-border',
      'text-primary',
      'placeholder:text-placeholder',
      
      variantClasses[variant],
      sizeClasses[inputSize],
      getBorderRadius(),
      borderWidthClasses[borderWidth],
      
      variant !== 'flushed' && variant !== 'unstyled' && stateClasses.border,
      variant === 'flushed' && `border-b ${stateClasses.border}`,
      
      isOpen ? 'shadow-md' : shadowClasses[shadow],
      
      // فوکوس استایل مخصوص حالت باز
      getFocusStyles(),
      
      hoverClassesMap[variant],
      stateClasses.hover,
      
      disabled && 'opacity-50 cursor-not-allowed bg-secondary/20 text-tertiary',
      
      // در حالت باز، border پایین را حذف می‌کنیم تا با dropdown یکپارچه شود
      isOpen && 'border-b-0',
      
      className
    )
    
    const labelClasses = cn(
      'text-sm font-medium transition-colors duration-200 block',
      stateClasses.label,
      required && "after:content-['*'] after:ml-0.5 after:text-error"
    )
    
    const renderMessage = () => {
      if (!messageText) return null
      
      return (
        <div className={cn(
          'mt-3 px-3 py-2 rounded-full text-sm text-left animate-fade-in',
          stateClasses.messageBg,
          stateClasses.messageText
        )}>
          {messageText}
        </div>
      )
    }
    
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        
        <div className={cn("relative", label && "mt-1.5")}>
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={messageText ? `${inputId}-message` : undefined}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={inputClasses}
            {...props}
          />
        </div>
        
        <div className="min-h-14">
          {renderMessage()}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'