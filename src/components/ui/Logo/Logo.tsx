'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'

export interface LogoProps {
  variant?: 'default' | 'hero' | 'footer'
  className?: string
}

export function Logo({ variant = 'default', className = '' }: LogoProps) {
  const getSizeClasses = () => {
    switch (variant) {
      case 'hero':
  return {
    box: 'w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl xs:rounded-xl sm:rounded-2xl md:rounded-2xl',
    icon: 'text-2x1 xs:text-3xl sm:text-3xl md:text-4xl',
    text: 'text-4xl xs:text-4xl sm:text-5xl md:text-6xl',
    gap: 'gap-2 xs:gap-2 sm:gap-3 md:gap-4',
  }
      case 'footer':
        return {
          text: 'text-sm md:text-base',
          gap: 'gap-0',
        }
      default:
        return {
          box: 'w-8 h-8 rounded-lg',
          icon: 'text-sm md:text-base',
          text: 'text-base md:text-lg',
          gap: 'gap-2',
        }
    }
  }

  const sizes = getSizeClasses()

  if (variant === 'footer') {
    return (
      <Link 
        href="/" 
        className={`inline-flex items-center ${sizes.gap} group ${className}`}
      >
        <span className={`font-bold ${sizes.text} text-white`}>
          ESP{' '}
          <span className="font-bold text-white">
            Webapp
          </span>
        </span>
      </Link>
    )
  }

  if (variant === 'hero') {
    return (
      <div 
        className={`inline-flex items-center ${sizes.gap} ${className}`}
      >
        <div className={`${sizes.box} logo-icon flex items-center justify-center shadow-md`}>
          <FontAwesomeIcon
            icon={faRocket}
            className={`${sizes.icon} text-white`}
          />
        </div>
        
        <span className={`font-bold ${sizes.text} text-gray-900 dark:text-white`}>
          ESP{' '}
          <span className="font-bold gradient-logo-text">
            Webapp
          </span>
        </span>
      </div>
    )
  }

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center ${sizes.gap} group ${className}`}
    >
      <div className={`${sizes.box} logo-icon flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105`}>
        <FontAwesomeIcon
          icon={faRocket}
          className={`${sizes.icon} text-white`}
        />
      </div>
      
      <span className={`font-bold ${sizes.text} text-gray-900 dark:text-white`}>
        ESP{' '}
        <span className="font-bold gradient-logo-text">
          Webapp
        </span>
      </span>
    </Link>
  )
}