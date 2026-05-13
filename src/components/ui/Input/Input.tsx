'use client'

import { forwardRef } from 'react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  required?: boolean
  
  inputSize?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  borderWidth?: 'none' | 'sm' | 'md' | 'lg'
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' | 'white'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled'
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

const textColorMap = {
  default: 'text-primary',
  filled: 'text-primary',
  flushed: 'text-primary',
  unstyled: 'text-primary',
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

const inputSizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
}

const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-tertiary disabled:text-tertiary'

const placeholderStyles = 'placeholder:text-tertiary'

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
    
    const inputClasses = [
      'w-full transition-all duration-200 outline-none',
      textColorMap[variant],
      variantStyles[variant],
      inputSizeStyles[inputSize],
      radiusMap[radius],
      borderWidthMap[borderWidth],
      borderColorNormalMap[borderColor],
      !error && borderColorFocusMap[borderColor],
      !error && hoverStyles[variant],
      shadowMap[shadow],
      error && 'border-error focus:border-error focus:ring-error/20',
      error && 'hover:border-error/70',
      disabledStyles,
      placeholderStyles,
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
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'