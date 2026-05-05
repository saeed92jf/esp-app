'use client'

import Link from 'next/link'

export interface LogoProps {
  variant?: 'default' | 'footer'
  className?: string
}

export function Logo({ variant = 'default', className = '' }: LogoProps) {
  const size = variant === 'footer' ? 'w-9 h-9' : 'w-10 h-10'
  
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <div className={`${size} bg-linear-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
        <span className="text-white font-bold text-lg md:text-xl">E</span>
      </div>
      <span className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white">
        ESP<span className="text-blue-600">Webapp</span>
      </span>
    </Link>
  )
}