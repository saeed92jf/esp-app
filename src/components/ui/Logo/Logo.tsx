'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import { ReactNode } from 'react'

export interface LogoProps {
  variant?: 'hero' | 'header' | 'footer'
  className?: string
  customIcon?: ReactNode
  customSvg?: string
}

export function Logo({ variant = 'header', className = '', customIcon, customSvg }: LogoProps) {
  const getSizeClasses = () => {
    switch (variant) {
      case 'hero':
        return {
          box: 'w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl xs:rounded-xl sm:rounded-2xl md:rounded-2xl gradient-btn-primary',
          icon: 'text-3xl xs:text-4xl sm:text-4xl md:text-5xl',
          svg: 'w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          text: 'text-4xl xs:text-5xl sm:text-6xl md:text-7xl',
          gap: 'gap-3 xs:gap-3 sm:gap-4 md:gap-5',
        }
      case 'header':
        return {
          box: 'w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl gradient-btn-primary',
          icon: 'text-lg xs:text-xl sm:text-xl',
          svg: 'w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6',
          text: 'text-xl xs:text-2xl sm:text-2xl',
          gap: 'gap-2 xs:gap-2 sm:gap-2.5',
        }
      case 'footer':
        return {
          box: 'w-7 h-7 rounded-lg gradient-btn-primary',
          icon: 'text-base',
          svg: 'w-4 h-4',
          text: 'text-lg',
          gap: 'gap-1.5',
        }
    }
  }

  const sizes = getSizeClasses()

  const renderIcon = () => {
    if (customSvg) {
      return (
        <img 
          src={customSvg} 
          alt="Logo"
          className={`${sizes.svg} object-contain`}
        />
      )
    }
    
    if (customIcon) {
      return customIcon
    }
    
    return (
      <FontAwesomeIcon
        icon={faRocket}
        className={`${sizes.icon}  text-white`}
      />
    )
  }

  const logoContent = (
    <>
      <div className={`${sizes.box} bg-primary flex items-center justify-center shadow-md ${variant !== 'hero' ? 'transition-all duration-300 group-hover:scale-105' : ''}`}>
        {renderIcon()}
      </div>
      
      <span className={`font-bold ${sizes.text} text-primary`}>
        ESP{' '}
        <span className={`font-bold ${variant === 'hero' ? 'text-gradient-primary' : 'text-primary'}`}>
          Webapp
        </span>
      </span>
    </>
  )

  // Hero variant  
  if (variant === 'hero') {
    return (
      <div className={`inline-flex items-center ${sizes.gap} ${className}`}>
        {logoContent}
      </div>
    )
  }

  return (
    <Link href="/" className={`inline-flex items-center ${sizes.gap} group ${className}`}>
      {logoContent}
    </Link>
  )
}