// components/ui/Button.tsx
'use client'

import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

// ============================================
// BUTTON COMPONENT
// Fully customizable button using Tailwind CSS only
// All animations are defined in tailwind.config.ts
// No separate CSS file needed
// ============================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  
  /**
   * Border radius of the button
   * @default 'xl'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  
  /**
   * Whether to show border outline
   * @default false
   */
  border?: boolean
  
  /**
   * Border color when border is true
   * @default 'primary'
   */
  borderColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'white'
  
  /**
   * Hover animation effect (from tailwind.config.ts)
   * @default 'none'
   */
  animation?: 'slide-text-up' | 'slide-text-down' | 'slide-text-left' | 'slide-text-right'
    | 'slide-bg-left' | 'slide-bg-right' | 'slide-bg-top' | 'slide-bg-bottom'
    | 'icon-slide' | 'icon-bounce' | 'icon-rotate'
    | 'line-slide' | 'line-expand'
    | 'scale' | 'glow' | 'pulse' | 'none'
  
  /**
   * Text to show on hover for slide-text animations
   */
  hoverText?: string
  
  /**
   * Position of the icon within the button
   * @default 'right'
   */
  iconPosition?: 'left' | 'right'
  
  /**
   * Icon animation effect on hover
   * @default 'none'
   */
  iconAnimation?: 'slide' | 'bounce' | 'rotate' | 'none'
  
  /**
   * Color of the underline for line animations
   * @default 'primary'
   */
  underlineColor?: 'primary' | 'white' | 'current'
  
  /**
   * Height of the underline
   * @default 'md'
   */
  underlineHeight?: 'sm' | 'md' | 'lg'
  
  /**
   * Icon to display on the left side
   */
  leftIcon?: any
  
  /**
   * Icon to display on the right side
   */
  rightIcon?: any
  
  /**
   * Makes the button take full width of its container
   * @default false
   */
  fullWidth?: boolean
  
  /**
   * Shows loading spinner and disables the button
   * @default false
   */
  isLoading?: boolean
  
  /**
   * Custom background color (overrides variant)
   */
  customBg?: string
  
  /**
   * Custom text color (overrides variant)
   */
  customColor?: string
  
  /**
   * When true, renders as child component (for use with Link)
   * @default false
   */
  asChild?: boolean
}

// ============================================
// BUTTON VARIANT CLASSES
// All styles use semantic CSS variables from tailwind.config.ts
// ============================================

const variantClasses: Record<string, string> = {
  default: 'bg-primary text-inverse hover:bg-primary/90 shadow-sm',
  primary: 'bg-primary text-inverse hover:bg-primary/90 shadow-sm',
  secondary: 'bg-secondary text-inverse hover:bg-secondary/90 shadow-sm',
  outline: 'border border-light bg-transparent text-primary hover:bg-tertiary',
  ghost: 'text-secondary hover:bg-tertiary hover:text-primary',
  danger: 'bg-danger text-inverse hover:bg-danger/90 shadow-sm',
  success: 'bg-success text-inverse hover:bg-success/90 shadow-sm',
  warning: 'bg-warning text-inverse hover:bg-warning/90 shadow-sm',
}

// ============================================
// BUTTON SIZE CLASSES
// Using semantic spacing from tailwind.config.ts
// ============================================

const sizeClasses: Record<string, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg',
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-2xl',
  xl: 'px-6 py-3.5 text-lg rounded-2xl',
}

// ============================================
// RADIUS CLASSES
// Using semantic border radius from tailwind.config.ts
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
// BORDER COLOR CLASSES
// Using semantic border colors from tailwind.config.ts
// ============================================

const borderColorClasses: Record<string, string> = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  danger: 'border-error',
  success: 'border-success',
  warning: 'border-warning',
  white: 'border-white',
}

// ============================================
// ANIMATION CLASSES
// All animations are defined in tailwind.config.ts keyframes
// ============================================

const animationClasses: Record<string, string> = {
  'slide-text-up': 'group',
  'slide-text-down': 'group',
  'slide-text-left': 'group',
  'slide-text-right': 'group',
  'slide-bg-left': 'group relative overflow-hidden z-10 before:absolute before:inset-0 before:-translate-x-full before:bg-white/15 before:transition-all before:duration-300 before:z-[-1] hover:before:translate-x-0',
  'slide-bg-right': 'group relative overflow-hidden z-10 before:absolute before:inset-0 before:translate-x-full before:bg-white/15 before:transition-all before:duration-300 before:z-[-1] hover:before:translate-x-0',
  'slide-bg-top': 'group relative overflow-hidden z-10 before:absolute before:inset-0 before:-translate-y-full before:bg-white/15 before:transition-all before:duration-300 before:z-[-1] hover:before:translate-y-0',
  'slide-bg-bottom': 'group relative overflow-hidden z-10 before:absolute before:inset-0 before:translate-y-full before:bg-white/15 before:transition-all before:duration-300 before:z-[-1] hover:before:translate-y-0',
  'icon-slide': 'group',
  'icon-bounce': 'group',
  'icon-rotate': 'group',
  'line-slide': 'group relative overflow-hidden',
  'line-expand': 'group relative',
  'scale': 'hover:scale-105 transition-transform duration-200',
  'glow': 'hover:shadow-glow-sm transition-shadow duration-200',
  'pulse': 'hover:animate-pulse',
  'none': '',
}

// ============================================
// UNDERLINE CLASSES
// ============================================

const underlineColorClasses: Record<string, string> = {
  primary: 'bg-primary',
  white: 'bg-white',
  current: 'bg-current',
}

const underlineHeightClasses: Record<string, string> = {
  sm: 'h-0.5',
  md: 'h-1',
  lg: 'h-1.5',
}

// ============================================
// ICON ANIMATION CLASSES
// ============================================

const iconAnimationClasses: Record<string, string> = {
  slide: 'group-hover:translate-x-1 transition-transform duration-200',
  bounce: 'group-hover:animate-bounce-soft',
  rotate: 'group-hover:rotate-90 transition-transform duration-200',
  none: '',
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
    
    // Base styles - shared across all button variants
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2 font-medium',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'transition-all duration-200',
      sizeClasses[size],
      radiusClasses[radius],
      variantClasses[variant],
      border && `border-2 ${borderColorClasses[borderColor]}`,
      fullWidth && 'w-full',
      animation !== 'none' && animation !== 'scale' && animation !== 'glow' && animation !== 'pulse' && 'group',
      className
    )
    
    // Custom inline styles for overriding default colors
    const customStyles = {
      ...(customBg && { backgroundColor: customBg }),
      ...(customColor && { color: customColor }),
    }
    
    // Check if text animation is active (sliding text effect)
    const isTextAnimation = animation === 'slide-text-up' || 
                            animation === 'slide-text-down' || 
                            animation === 'slide-text-left' || 
                            animation === 'slide-text-right'
    
    // Check if underline animation is active
    const isUnderlineAnimation = animation === 'line-slide' || animation === 'line-expand'
    
    // Get icon animation class
    const iconAnimClass = iconAnimation !== 'none' ? iconAnimationClasses[iconAnimation] : ''
    
    // Text to show on hover for slide animations
    const hoverDisplayText = hoverText || children
    
    // Render icon based on position and loading state
    const renderIcon = () => {
      const iconClass = cn('h-4 w-4', iconAnimClass)
      
      if (isLoading) {
        return <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
      }
      if (iconPosition === 'left' && leftIcon) {
        return <FontAwesomeIcon icon={leftIcon} className={iconClass} />
      }
      if (iconPosition === 'right' && rightIcon) {
        return <FontAwesomeIcon icon={rightIcon} className={iconClass} />
      }
      return null
    }
    
    // Special handling for scale animation (no group class)
    if (animation === 'scale') {
      return (
        <Comp
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(baseStyles, 'hover:scale-105 transition-transform duration-200', className)}
          style={customStyles}
          {...props}
        >
          {(isLoading || (iconPosition === 'left' && leftIcon)) && renderIcon()}
          <span>{children}</span>
          {!isLoading && iconPosition === 'right' && rightIcon && renderIcon()}
        </Comp>
      )
    }
    
    // Special handling for glow animation
    if (animation === 'glow') {
      return (
        <Comp
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(baseStyles, 'hover:shadow-glow-sm transition-shadow duration-200', className)}
          style={customStyles}
          {...props}
        >
          {(isLoading || (iconPosition === 'left' && leftIcon)) && renderIcon()}
          <span>{children}</span>
          {!isLoading && iconPosition === 'right' && rightIcon && renderIcon()}
        </Comp>
      )
    }
    
    // Special handling for pulse animation
    if (animation === 'pulse') {
      return (
        <Comp
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(baseStyles, 'hover:animate-pulse', className)}
          style={customStyles}
          {...props}
        >
          {(isLoading || (iconPosition === 'left' && leftIcon)) && renderIcon()}
          <span>{children}</span>
          {!isLoading && iconPosition === 'right' && rightIcon && renderIcon()}
        </Comp>
      )
    }
    
    // Slide background animations - use the pre-defined class from animationClasses
    if (animation === 'slide-bg-left' || animation === 'slide-bg-right' || 
        animation === 'slide-bg-top' || animation === 'slide-bg-bottom') {
      return (
        <Comp
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(baseStyles, animationClasses[animation], className)}
          style={customStyles}
          {...props}
        >
          {(isLoading || (iconPosition === 'left' && leftIcon)) && renderIcon()}
          <span className="relative z-10">{children}</span>
          {!isLoading && iconPosition === 'right' && rightIcon && renderIcon()}
        </Comp>
      )
    }
    
    // Line animations (slide and expand)
    if (isUnderlineAnimation) {
      return (
        <Comp
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(baseStyles, animationClasses[animation], className)}
          style={customStyles}
          {...props}
        >
          {(isLoading || (iconPosition === 'left' && leftIcon)) && renderIcon()}
          
          <span className="relative">
            {children}
            <span className={cn(
              'absolute bottom-0 left-0 transition-all duration-300',
              underlineHeightClasses[underlineHeight],
              underlineColorClasses[underlineColor],
              animation === 'line-slide' && '-left-full group-hover:left-0',
              animation === 'line-expand' && 'left-1/2 w-0 group-hover:left-0 group-hover:w-full'
            )} />
          </span>
          
          {!isLoading && iconPosition === 'right' && rightIcon && renderIcon()}
        </Comp>
      )
    }
    
    // Text slide animations (sliding text on hover)
    if (isTextAnimation) {
      return (
        <Comp
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(baseStyles, 'overflow-hidden', className)}
          style={customStyles}
          {...props}
        >
          {(isLoading || (iconPosition === 'left' && leftIcon)) && renderIcon()}
          
          <span className="relative inline-flex flex-col items-center transition-transform duration-200 group-hover:-translate-y-full">
            <span className="inline-block">{children}</span>
            <span className="absolute inset-0 inline-block translate-y-full group-hover:translate-y-0">
              {hoverDisplayText}
            </span>
          </span>
          
          {!isLoading && iconPosition === 'right' && rightIcon && renderIcon()}
        </Comp>
      )
    }
    
    // Icon animations (slide, bounce, rotate on icon only)
    if (iconAnimation !== 'none') {
      return (
        <Comp
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(baseStyles, className)}
          style={customStyles}
          {...props}
        >
          {(isLoading || (iconPosition === 'left' && leftIcon)) && renderIcon()}
          <span>{children}</span>
          {!isLoading && iconPosition === 'right' && rightIcon && renderIcon()}
        </Comp>
      )
    }
    
    // Default button render (no animations)
    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, className)}
        style={customStyles}
        {...props}
      >
        {(isLoading || (iconPosition === 'left' && leftIcon)) && renderIcon()}
        <span>{children}</span>
        {!isLoading && iconPosition === 'right' && rightIcon && renderIcon()}
      </Comp>
    )
  }
)

Button.displayName = 'Button'