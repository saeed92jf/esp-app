'use client'

import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  border?: boolean
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'white'
  animation?: 'slide-text-up' | 'slide-text-down' | 'slide-text-left' | 'slide-text-right'
    | 'slide-bg-left' | 'slide-bg-right' | 'slide-bg-top' | 'slide-bg-bottom'
    | 'icon-slide' | 'icon-bounce' | 'icon-rotate'
    | 'line-slide' | 'line-expand'
    | 'scale' | 'glow' | 'pulse' | 'none'
  hoverText?: string
  iconPosition?: 'left' | 'right'
  iconAnimation?: 'slide' | 'bounce' | 'rotate' | 'none'
  underlineColor?: 'primary' | 'white' | 'current'
  underlineHeight?: 'sm' | 'md' | 'lg'
  leftIcon?: any
  rightIcon?: any
  fullWidth?: boolean
  isLoading?: boolean
  customBg?: string
  customColor?: string
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    radius = 'xl',
    border = false,
    borderColor = 'primary',
    animation = 'none',
    hoverText,
    iconPosition = 'right',
    iconAnimation = 'none',
    underlineColor = 'primary',
    underlineHeight = 'md',
    fullWidth, 
    isLoading, 
    leftIcon, 
    rightIcon,
    children, 
    disabled, 
    className,
    customBg,
    customColor,
    asChild = false,
    ...props 
  }, ref) => {
    
    const Comp = asChild ? Slot : 'button'
    const baseStyles = 'btn'
    
   const variants = {
  default: 'btn-primary',
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  success: 'btn-success',
  warning: 'btn-warning',
}
    
    const sizes = {
      xs: 'btn-xs',
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
      xl: 'btn-xl',
    }
    
    const radiusClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    }
    
    const borderColorClasses = {
      primary: 'border-primary',
      secondary: 'border-secondary',
      danger: 'border-error',
      success: 'border-success',
      warning: 'border-warning',
      white: 'border-white',
    }
    
    const animations = {
      'slide-text-up': 'btn-animate-slide-text-up',
      'slide-text-down': 'btn-animate-slide-text-down',
      'slide-text-left': 'btn-animate-slide-text-left',
      'slide-text-right': 'btn-animate-slide-text-right',
      'slide-bg-left': 'btn-animate-slide-bg-left',
      'slide-bg-right': 'btn-animate-slide-bg-right',
      'slide-bg-top': 'btn-animate-slide-bg-top',
      'slide-bg-bottom': 'btn-animate-slide-bg-bottom',
      'icon-slide': 'btn-animate-icon-slide',
      'icon-bounce': 'btn-animate-icon-bounce',
      'icon-rotate': 'btn-animate-icon-rotate',
      'line-slide': 'btn-animate-line-slide',
      'line-expand': 'btn-animate-line-expand',
      'scale': 'btn-animate-scale',
      'glow': 'btn-animate-glow',
      'pulse': 'btn-animate-pulse',
      'none': '',
    }
    
    const underlineHeights = {
      sm: 'h-0.5',
      md: 'h-1',
      lg: 'h-1.5',
    }
    
    const underlineColors = {
      primary: 'bg-primary',
      white: 'bg-inverse',
      current: 'bg-current',
    }
    
    const getIcon = () => {
      if (isLoading) return <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
      if (iconPosition === 'left') return leftIcon && <FontAwesomeIcon icon={leftIcon} className="icon-animate w-4 h-4" />
      if (iconPosition === 'right') return rightIcon && <FontAwesomeIcon icon={rightIcon} className="icon-animate w-4 h-4" />
      return null
    }
    
    const hoverDisplayText = hoverText || children
    const isTextAnimation = animation === 'slide-text-up' || 
                            animation === 'slide-text-down' || 
                            animation === 'slide-text-left' || 
                            animation === 'slide-text-right'
    
    const isUnderlineAnimation = animation === 'line-slide' || animation === 'line-expand'
    
    const borderClass = border ? `border-2 ${borderColorClasses[borderColor]}` : ''
    
    const customStyles = {
      ...(customBg && { backgroundColor: customBg }),
      ...(customColor && { color: customColor }),
    }
    
    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${radiusClasses[radius]} ${animations[animation]} ${borderClass} ${fullWidth ? 'btn-full' : ''} ${className || ''} group`}
        style={customStyles}
        {...props}
      >
        {isLoading && (
          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
        )}
        
        {!isLoading && iconPosition === 'left' && leftIcon && (
          <FontAwesomeIcon icon={leftIcon} className="icon-animate w-4 h-4" />
        )}
        
        {isTextAnimation ? (
          <span className="btn-text-wrapper">
            <span className="btn-text-default">{children}</span>
            <span className="btn-text-hover">{hoverDisplayText}</span>
          </span>
        ) : (
          <span>{children}</span>
        )}
        
        {isUnderlineAnimation && (
          <span className={`btn-underline ${underlineHeights[underlineHeight]} ${underlineColors[underlineColor]}`} />
        )}
        
        {!isLoading && iconPosition === 'right' && rightIcon && (
          <FontAwesomeIcon icon={rightIcon} className="icon-animate w-4 h-4" />
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'