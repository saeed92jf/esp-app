// components/ui/Skeleton.tsx
'use client'

import { cn } from '@/lib/utils'

// ============================================
// SKELETON COMPONENT
// Loading placeholder with pulse animation
// Supports multiple variants and custom dimensions
// ============================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the skeleton
   * @default 'text'
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  
  /**
   * Custom width - can be string (rem/px/%) or number (px)
   * @example '100%', '200px', 'w-20', 48
   */
  width?: string | number
  
  /**
   * Custom height - can be string (rem/px/%) or number (px)
   * @example '20px', 'h-10', 32
   */
  height?: string | number
  
  /**
   * Animation type for loading effect
   * @default 'pulse'
   */
  animation?: 'pulse' | 'shimmer' | 'none'
  
  /**
   * Number of lines for text variant (creates stacked skeletons)
   * @default 1
   */
  lines?: number
  
  /**
   * Gap between lines when lines > 1
   * Uses Tailwind spacing classes
   * @default 'space-y-2'
   */
  gap?: string
  
  /**
   * Border radius size
   * @default 'lg'
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  
  /**
   * Additional custom classes
   */
  className?: string
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  lines = 1,
  gap = 'space-y-2',
  rounded = 'lg',
  className,
  ...props
}: SkeletonProps) {
  // Base styles shared across all skeleton variants
  const baseClasses = cn(
    // Background colors - semantic tokens for light/dark mode
    'bg-gray-200 dark:bg-gray-800',
    // Pulse animation - creates gentle opacity cycling
    animation === 'pulse' && 'animate-pulse',
    // Shimmer animation - creates moving gradient effect
    animation === 'shimmer' && 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-[shimmer_1.5s_infinite]',
    className
  )
  
  // Border radius mapping - using semantic tokens from Tailwind config
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  }
  
  // Convert numeric values to pixel strings and build inline styles
  const getSizeStyles = () => {
    const styles: React.CSSProperties = {}
    
    if (width) {
      styles.width = typeof width === 'number' ? `${width}px` : width
    }
    if (height) {
      styles.height = typeof height === 'number' ? `${height}px` : height
    }
    
    return styles
  }
  
  /**
   * Renders multiple stacked text lines
   * Last line is shorter (80% width) for realistic text appearance
   */
  const renderTextSkeleton = () => {
    // Single line - simple skeleton
    if (lines === 1) {
      return (
        <div
          className={cn(baseClasses, roundedClasses[rounded])}
          style={{
            width: width || '100%',
            height: height || '1rem',
            ...getSizeStyles(),
          }}
          {...props}
        />
      )
    }
    
    // Multiple lines - stacked with configurable gap
    return (
      <div className={cn('flex flex-col', gap)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, roundedClasses[rounded])}
            style={{
              // Last line is 80% width for natural text block appearance
              width: index === lines - 1 && lines > 1 ? '80%' : width || '100%',
              height: height || '1rem',
              ...getSizeStyles(),
            }}
            {...props}
          />
        ))}
      </div>
    )
  }
  
  // Circular avatar/profile picture skeleton
  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full')}
        style={{
          width: width || '3rem',
          height: height || '3rem',
          ...getSizeStyles(),
        }}
        {...props}
      />
    )
  }
  
  // Rectangle without border radius (for images, banners, etc.)
  if (variant === 'rectangular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-none')}
        style={{
          width: width || '100%',
          height: height || '6rem',
          ...getSizeStyles(),
        }}
        {...props}
      />
    )
  }
  
  // Rounded rectangle (default for cards, containers)
  if (variant === 'rounded') {
    return (
      <div
        className={cn(baseClasses, roundedClasses[rounded])}
        style={{
          width: width || '100%',
          height: height || '6rem',
          ...getSizeStyles(),
        }}
        {...props}
      />
    )
  }
  
  // Default: text skeleton
  return renderTextSkeleton()
}