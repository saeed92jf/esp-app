// components/layout/SettingsModal/SettingsModal.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faMoon, faSun, faGlobe, faShieldAlt, faPalette, faCheck, faDesktop } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '@/theme'
import { cn } from '@/lib/utils'

// ============================================
// SETTINGS MODAL COMPONENT
// Dropdown menu for theme and color settings
// Opens below the settings button or above if not enough space
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

interface SettingsModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
}

const colorOptions = [
  { name: 'Blue', className: 'primary-color-blue', hue: 239, sat: 50, light: 50, bgColor: '#4f46e5' },
  { name: 'Green', className: 'primary-color-green', hue: 142, sat: 60, light: 40, bgColor: '#10b981' },
  { name: 'Red', className: 'primary-color-red', hue: 0, sat: 84, light: 45, bgColor: '#ef4444' },
  { name: 'Orange', className: 'primary-color-orange', hue: 25, sat: 84, light: 45, bgColor: '#f97316' },
  { name: 'Purple', className: 'primary-color-purple', hue: 262, sat: 83, light: 45, bgColor: '#a855f7' },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const modalRef = useRef<HTMLDivElement>(null)
  const [activeColor, setActiveColor] = useState('primary-color-red')
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')

  // Check available space to position dropdown correctly
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleColorChange = (colorClassName: string, hue: number, sat: number, light: number) => {
    // Remove previous color classes
    document.documentElement.classList.remove(
      'primary-color-blue',
      'primary-color-green',
      'primary-color-red',
      'primary-color-orange',
      'primary-color-purple'
    )
    
    // Add new color class
    document.documentElement.classList.add(colorClassName)
    setActiveColor(colorClassName)
    
    // Update HSL variables
    const root = document.documentElement
    root.style.setProperty('--primary-h', hue.toString())
    root.style.setProperty('--primary-s', `${sat}%`)
    root.style.setProperty('--primary-l', `${light}%`)
  }

  if (!isOpen) return null

  return (
    <div 
      ref={modalRef}
      className={cn(
        'absolute right-0 z-50 w-64 max-w-[calc(100vw-1rem)]',
        'bg-primary rounded-2xl shadow-xl border border-light overflow-hidden',
        'transition-all duration-200 animate-fade-in-up',
        position === 'bottom' ? 'mt-2 top-full' : 'mb-2 bottom-full'
      )}
      style={{
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-light bg-linear-to-r from-primary/5 to-transparent">
        <h3 className="font-semibold text-sm text-primary">Settings</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-tertiary transition-colors"
          aria-label="Close settings"
        >
          <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5 text-tertiary" />
        </button>
      </div>

      {/* Body */}
      <div className="py-2">
        {/* Theme Section */}
        <div className="px-4 py-2.5 hover:bg-tertiary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faGlobe} className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-secondary">Appearance</span>
          </div>
          
          <div className="flex flex-col gap-2 ml-5">
            {/* Light Theme Option */}
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all',
                theme === 'light'
                  ? 'bg-primary text-primary shadow-sm'
                  : 'bg-tertiary text-secondary hover:bg-tertiary/80'
              )}
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faSun} className="w-4 h-4" />
                Light
              </span>
              {theme === 'light' && (
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Dark Theme Option */}
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all',
                theme === 'dark'
                  ? 'bg-primary text-primary shadow-sm'
                  : 'bg-tertiary text-secondary hover:bg-tertiary/80'
              )}
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMoon} className="w-4 h-4" />
                Dark
              </span>
              {theme === 'dark' && (
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
              )}
            </button>

            {/* System Theme Option */}
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all',
                theme === 'system'
                  ? 'bg-primary text-primary shadow-sm'
                  : 'bg-tertiary text-secondary hover:bg-tertiary/80'
              )}
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faDesktop} className="w-4 h-4" />
                System
              </span>
              {theme === 'system' && (
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="h-px bg-light my-1" />

        {/* Primary Color Section */}
        <div className="px-4 py-2.5 hover:bg-tertiary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faPalette} className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-secondary">Primary Color</span>
          </div>
          <div className="flex gap-2 ml-5 flex-wrap">
            {colorOptions.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.className, color.hue, color.sat, color.light)}
                className={cn(
                  'relative w-7 h-7 rounded-full transition-all hover:scale-110',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                  activeColor === color.className && 'ring-2 ring-offset-2 ring-primary scale-110'
                )}
                style={{ 
                  backgroundColor: color.bgColor,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
                title={color.name}
              >
                {activeColor === color.className && (
                  <FontAwesomeIcon 
                    icon={faCheck} 
                    className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow-md"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-light my-1" />

        {/* Security Section */}
        <div className="px-4 py-2.5 hover:bg-tertiary/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldAlt} className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-secondary">2FA Security</span>
            </div>
            <button className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-tertiary text-secondary hover:bg-tertiary/80 transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}