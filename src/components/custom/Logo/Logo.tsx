// components/ui/Logo.tsx
'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// LOGO COMPONENT
// Responsive logo with gradient background and customizable icon
// Uses Tailwind CSS only - no separate CSS file needed
// ============================================

export interface LogoProps {
  /**
   * Size variant of the logo
   * - hero: Large size for landing page
   * - header: Medium size for navigation bar
   * - footer: Small size for footer section
   * @default 'header'
   */
  variant?: 'hero' | 'header' | 'footer'
  
  /** Additional CSS classes for custom styling */
  className?: string
  
  /** Custom React component icon (e.g., SVG) */
  customIcon?: ReactNode
  
  /** Path to custom SVG image file */
  customSvg?: string
}

export function Logo({ variant = 'header', className = '', customIcon, customSvg }: LogoProps) {
  // Size configurations based on variant
  const sizeConfig = {
    hero: {
      box: 'w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl xs:rounded-xl sm:rounded-2xl md:rounded-2xl',
      icon: 'text-3xl xs:text-4xl sm:text-4xl md:text-5xl',
      svg: 'w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
      text: 'text-4xl xs:text-5xl sm:text-6xl md:text-7xl',
      gap: 'gap-3 xs:gap-3 sm:gap-4 md:gap-5',
    },
    header: {
      box: 'w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl',
      icon: 'text-lg xs:text-xl sm:text-xl',
      svg: 'w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6',
      text: 'text-xl xs:text-2xl sm:text-2xl',
      gap: 'gap-2 xs:gap-2 sm:gap-2.5',
    },
    footer: {
      box: 'w-8 h-8 rounded-lg',
      icon: 'text-base',
      svg: 'w-4 h-4',
      text: 'text-base',
      gap: 'gap-1.5',
    },
  }

  const sizes = sizeConfig[variant]

  // Render the appropriate icon (SVG, custom component, or default rocket)
  const renderIcon = () => {
    if (customSvg) {
      return (
        <img 
          src={customSvg} 
          alt="Logo"
          className={cn(sizes.svg, 'object-contain select-none')}
          draggable={false}
        />
      )
    }
    
    if (customIcon) {
      return customIcon
    }
    
    return (
      <FontAwesomeIcon
        icon={faRocket}
        className={cn(sizes.icon, 'text-inverse select-none')}
      />
    )
  }

  // Logo content shared between hero and link variants
  const logoContent = (
    <>
      {/* Logo icon box with gradient background - بدون انیمیشن */}
      <div className={cn(
        sizes.box,
        'bg-gradient-logo flex items-center justify-center shadow-md select-none'
      )}>
        {renderIcon()}
      </div>
      
      {/* Logo text - بدون انیمیشن و بدون قابلیت انتخاب */}
      <span className={cn('font-bold select-none', sizes.text, 'text-primary')}>
        ESP{' '}
        <span className={cn(
          'font-bold select-none',
          variant === 'hero' ? 'text-gradient-primary' : 'text-primary'
        )}>
          Webapp
        </span>
      </span>
    </>
  )

  // Hero variant - no link, just the logo
  if (variant === 'hero') {
    return (
      <div className={cn('inline-flex items-center', sizes.gap, className)}>
        {logoContent}
      </div>
    )
  }

  // Header and footer variants - clickable link to home (بدون انیمیشن گروهی)
  return (
    <Link 
      href="/" 
      className={cn('inline-flex items-center', sizes.gap, className)}
      draggable={false}
    >
      {logoContent}
    </Link>
  )
}