// components/ui/ThemeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

// ============================================
// THEME TOGGLE COMPONENT
// Dropdown menu for switching between light, dark, and system themes
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.theme-toggle-dropdown')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!mounted) return null

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return faMoon
      case 'light': return faSun
      default: return faDesktop
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark': return 'Dark'
      case 'light': return 'Light'
      default: return 'System'
    }
  }

  const themes = [
    { id: 'light', label: 'Light', icon: faSun, iconColor: 'text-yellow-500' },
    { id: 'dark', label: 'Dark', icon: faMoon, iconColor: 'text-indigo-400' },
    { id: 'system', label: 'System', icon: faDesktop, iconColor: 'text-gray-500' },
  ]

  return (
    <div className="relative theme-toggle-dropdown">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-secondary border border-light',
          'hover:bg-tertiary transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isOpen && 'ring-2 ring-ring scale-105'
        )}
        aria-label="Toggle theme"
      >
        {/* Icon with animation */}
        <div className="relative">
          <FontAwesomeIcon 
            icon={getThemeIcon()} 
            className={cn(
              'w-4 h-4 transition-all duration-500',
              theme === 'dark' && 'text-indigo-400 rotate-12',
              theme === 'light' && 'text-yellow-500 rotate-0',
              theme === 'system' && 'text-gray-500'
            )}
          />
          <span className="absolute inset-0 rounded-full bg-primary/20 scale-0 transition-transform duration-300 group-hover:scale-100" />
        </div>
        
        {/* Label */}
        <span className="text-sm font-medium text-primary hidden sm:inline">
          {getThemeLabel()}
        </span>
        
        {/* Chevron icon */}
        <svg 
          className={cn(
            'w-3 h-3 text-secondary transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div 
        className={cn(
          'absolute right-0 mt-2 w-48 bg-primary rounded-xl shadow-lg border border-light overflow-hidden z-50',
          'transition-all duration-300 transform origin-top-right',
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="py-1">
          {themes.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTheme(item.id)
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 group',
                theme === item.id 
                  ? 'bg-secondary text-primary' 
                  : 'text-secondary hover:bg-tertiary hover:text-primary'
              )}
            >
              {/* Icon container */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110',
                theme === item.id ? 'bg-primary/10' : 'bg-secondary'
              )}>
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={cn(
                    'w-4 h-4 transition-all duration-300',
                    item.iconColor,
                    theme === item.id && 'scale-110'
                  )}
                />
              </div>
              
              {/* Label */}
              <span className="flex-1 text-left text-sm font-medium">
                {item.label}
              </span>
              
              {/* Checkmark for active theme */}
              {theme === item.id && (
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
        
        {/* Decorative bottom line */}
        <div className="h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
      </div>
    </div>
  )
}