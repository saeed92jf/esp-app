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
          text: 'text-4xl md:text-6xl',
          gap: 'gap-3 md:gap-4',
        }
      case 'footer':
        return {
          text: 'text-sm md:text-base',
          gap: 'gap-1.5',
        }
      default:
        return {
          text: 'text-xl md:text-2xl',
          gap: 'gap-2',
        }
    }
  }

  const sizes = getSizeClasses()

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center ${sizes.gap} group ${className}`}
    >
    <FontAwesomeIcon
      icon={faRocket}
      className={`${sizes.text} fill-primary`}
    />
      
      <span className={`font-bold ${sizes.text} text-gray-900 dark:text-white`}>
        ESP{' '}
         <span className="gradient-logo-text font-bold ">
              Webapp
            </span>
      </span>
    </Link>
  )
}