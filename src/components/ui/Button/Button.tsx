'use client'

import { forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

// ============================================
// BUTTON PROPS INTERFACE
// ============================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Button variants
  variant?: 
    | 'primary' 
    | 'secondary' 
    | 'outline' 
    | 'ghost' 
    | 'danger' 
    | 'success' 
    | 'warning'
  
  // Button sizes
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  
  // Border radius - custom radius
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  
  // Border options
  border?: boolean
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'white'
  
  // Animation types
  animation?: 
    | 'slide-text-up'      // Slide text upward
    | 'slide-text-down'    // Slide text downward
    | 'slide-text-left'    // Slide text to left
    | 'slide-text-right'   // Slide text to right
    | 'slide-bg-left'      // Background slides from left
    | 'slide-bg-right'     // Background slides from right
    | 'slide-bg-top'       // Background slides from top
    | 'slide-bg-bottom'    // Background slides from bottom
    | 'icon-slide'         // Icon slides on hover
    | 'icon-bounce'        // Icon bounces on hover
    | 'icon-rotate'        // Icon rotates on hover
    | 'line-slide'         // Animated underline slides in
    | 'line-expand'        // Underline expands from center
    | 'scale'              // Button scales up
    | 'glow'               // Button glows
    | 'pulse'              // Button pulses
    | 'none'               // No animation
  
  // Text replacement for slide-text animations
  hoverText?: string
  
  // Icon position
  iconPosition?: 'left' | 'right'
  
  // Icon animation only (without text animation)
  iconAnimation?: 'slide' | 'bounce' | 'rotate' | 'none'
  
  // Underline animation configs
  underlineColor?: 'primary' | 'white' | 'current'
  underlineHeight?: 'sm' | 'md' | 'lg'
  
  // Icons
  leftIcon?: any
  rightIcon?: any
  
  // States
  fullWidth?: boolean
  isLoading?: boolean
  
  // Custom styles
  customBg?: string
  customColor?: string
}

// ============================================
// MAIN BUTTON COMPONENT
// ============================================
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    // Variant and size
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
    ...props 
  }, ref) => {
    
    // Base button classes
    const baseStyles = 'btn'
    
    // Variant classes
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
      success: 'btn-success',
      warning: 'btn-warning',
    }
    
    // Size classes
    const sizes = {
      xs: 'btn-xs',
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
      xl: 'btn-xl',
    }
    
    // Border radius classes
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
    
    // Border color classes
    const borderColorClasses = {
      primary: 'border-primary',
      secondary: 'border-secondary',
      danger: 'border-danger',
      success: 'border-success',
      warning: 'border-warning',
      white: 'border-white',
    }
    
    // Animation classes
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
    
    // Underline height classes
    const underlineHeights = {
      sm: 'h-0.5',
      md: 'h-1',
      lg: 'h-1.5',
    }
    
    // Underline color classes
    const underlineColors = {
      primary: 'bg-primary',
      white: 'bg-white',
      current: 'bg-current',
    }
    
    // Get icon based on position
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
    
    // Determine if border should be applied
    const borderClass = border ? `border-2 ${borderColorClasses[borderColor]}` : ''
    
    // Custom styles inline
    const customStyles = {
      ...(customBg && { backgroundColor: customBg }),
      ...(customColor && { color: customColor }),
    }
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${radiusClasses[radius]} ${animations[animation]} ${borderClass} ${fullWidth ? 'btn-full' : ''} ${className || ''} group`}
        style={customStyles}
        {...props}
      >
        {/* Loading state */}
        {isLoading && (
          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
        )}
        
        {/* Icon on left (when not loading) */}
        {!isLoading && iconPosition === 'left' && leftIcon && (
          <FontAwesomeIcon icon={leftIcon} className="icon-animate w-4 h-4" />
        )}
        
        {/* Button text with animation */}
        {isTextAnimation ? (
          <span className="btn-text-wrapper">
            <span className="btn-text-default">{children}</span>
            <span className="btn-text-hover">{hoverDisplayText}</span>
          </span>
        ) : (
          <span>{children}</span>
        )}
        
        {/* Underline animation */}
        {isUnderlineAnimation && (
          <span className={`btn-underline ${underlineHeights[underlineHeight]} ${underlineColors[underlineColor]}`} />
        )}
        
        {/* Icon on right (when not loading) */}
        {!isLoading && iconPosition === 'right' && rightIcon && (
          <FontAwesomeIcon icon={rightIcon} className="icon-animate w-4 h-4" />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'