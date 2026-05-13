// components/layout/SettingsModal/SettingsModal.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faMoon, faSun, faGlobe, faShieldAlt, faPalette, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '@/theme'

interface SettingsModalProps {
  isOpen: boolean
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
  const [activeColor, setActiveColor] = useState('primary-color-blue')
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')

  // بررسی فضای کافی برای نمایش منو در موبایل
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // اگر فضای کافی در پایین نیست، منو را بالا نمایش بده
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    }
  }, [isOpen])

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
    document.documentElement.classList.remove(
      'primary-color-blue',
      'primary-color-green',
      'primary-color-red',
      'primary-color-orange',
      'primary-color-purple'
    )
    
    document.documentElement.classList.add(colorClassName)
    setActiveColor(colorClassName)
    
    const root = document.documentElement
    root.style.setProperty('--primary-h', hue.toString())
    root.style.setProperty('--primary-s', `${sat}%`)
    root.style.setProperty('--primary-l', `${light}%`)
    
    localStorage.setItem('primary-color', colorClassName)
    localStorage.setItem('primary-hue', hue.toString())
    localStorage.setItem('primary-saturation', sat.toString())
    localStorage.setItem('primary-lightness', light.toString())
  }

  useEffect(() => {
    const savedColor = localStorage.getItem('primary-color')
    const savedHue = localStorage.getItem('primary-hue')
    const savedSat = localStorage.getItem('primary-saturation')
    const savedLight = localStorage.getItem('primary-lightness')
    
    if (savedColor) {
      document.documentElement.classList.add(savedColor)
      setActiveColor(savedColor)
    }
    
    if (savedHue && savedSat && savedLight) {
      const root = document.documentElement
      root.style.setProperty('--primary-h', savedHue)
      root.style.setProperty('--primary-s', savedSat)
      root.style.setProperty('--primary-l', savedLight)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div 
      ref={modalRef}
      className={`
        absolute right-0 z-50 w-80 sm:w-72
        bg-primary rounded-2xl shadow-xl border border-light overflow-hidden
        transition-all duration-200 animate-fade-in-up
        ${position === 'bottom' ? 'mt-2 top-full' : 'mb-2 bottom-full'}
      `}
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
        >
          <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5 text-tertiary" />
        </button>
      </div>

      {/* Body */}
      <div className="py-2">
        {/* Theme */}
        <div className="px-4 py-2.5 hover:bg-tertiary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faGlobe} className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-secondary">Appearance</span>
          </div>
          <div className="flex gap-1.5 ml-5">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'bg-primary text-inverse shadow-sm'
                  : 'bg-tertiary text-secondary hover:bg-tertiary/80'
              }`}
            >
              <FontAwesomeIcon icon={faSun} className="w-3 h-3 mr-1" />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-primary text-inverse shadow-sm'
                  : 'bg-tertiary text-secondary hover:bg-tertiary/80'
              }`}
            >
              <FontAwesomeIcon icon={faMoon} className="w-3 h-3 mr-1" />
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'system'
                  ? 'bg-primary text-inverse shadow-sm'
                  : 'bg-tertiary text-secondary hover:bg-tertiary/80'
              }`}
            >
              System
            </button>
          </div>
        </div>

        <div className="h-px bg-light my-1" />

        {/* Primary Color */}
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
                className={`relative w-7 h-7 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  activeColor === color.className ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                }`}
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

        {/* Security */}
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