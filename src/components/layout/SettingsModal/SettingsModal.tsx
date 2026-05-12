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
    // حذف کلاس‌های قبلی
    document.body.classList.remove(
      'primary-color-blue',
      'primary-color-green',
      'primary-color-red',
      'primary-color-orange',
      'primary-color-purple'
    )
    
    // اضافه کردن کلاس جدید
    document.body.classList.add(colorClassName)
    setActiveColor(colorClassName)
    
    // تغییر مستقیم متغیرها
    const root = document.documentElement
    root.style.setProperty('--primary-h', hue.toString())
    root.style.setProperty('--primary-s', `${sat}%`)
    root.style.setProperty('--primary-l', `${light}%`)
    
    // ذخیره در localStorage
    localStorage.setItem('primary-color', colorClassName)
    localStorage.setItem('primary-hue', hue.toString())
    localStorage.setItem('primary-saturation', sat.toString())
    localStorage.setItem('primary-lightness', light.toString())
  }

  // بارگذاری رنگ ذخیره شده در شروع
  useEffect(() => {
    const savedColor = localStorage.getItem('primary-color')
    const savedHue = localStorage.getItem('primary-hue')
    const savedSat = localStorage.getItem('primary-saturation')
    const savedLight = localStorage.getItem('primary-lightness')
    
    if (savedColor) {
      document.body.classList.add(savedColor)
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
      className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-linear-to-r from-primary-50/50 to-transparent dark:from-primary-900/20">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Settings</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Body */}
      <div className="py-2">
        {/* Theme */}
        <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faGlobe} className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Appearance</span>
          </div>
          <div className="flex gap-1.5 ml-5">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FontAwesomeIcon icon={faSun} className="w-3 h-3 mr-1" />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FontAwesomeIcon icon={faMoon} className="w-3 h-3 mr-1" />
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'system'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              System
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

        {/* Primary Color - انتخاب رنگ با نمایش رنگ فعال */}
        <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faPalette} className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Primary Color</span>
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
                {/* آیکون تیک برای رنگ فعال */}
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

        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

        {/* Security */}
        <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldAlt} className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">2FA Security</span>
            </div>
            <button className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}