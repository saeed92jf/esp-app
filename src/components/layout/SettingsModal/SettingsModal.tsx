// components/layout/SettingsModal/SettingsModal.tsx
'use client'

import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faMoon, faSun, faGlobe, faShieldAlt, faPalette } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '@/theme'
import { useUIStore } from '@/store/uiStore'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const colorOptions = [
  { name: 'Blue', value: 'blue', color: '#4f46e5', bgClass: 'bg-indigo-500' },
  { name: 'Green', value: 'green', color: '#10b981', bgClass: 'bg-emerald-500' },
  { name: 'Red', value: 'red', color: '#ef4444', bgClass: 'bg-red-500' },
  { name: 'Purple', value: 'purple', color: '#a855f7', bgClass: 'bg-purple-500' },
  { name: 'Orange', value: 'orange', color: '#f97316', bgClass: 'bg-orange-500' },
  { name: 'Pink', value: 'pink', color: '#ec4899', bgClass: 'bg-pink-500' },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const { customColor, setCustomColor } = useUIStore()
  const modalRef = useRef<HTMLDivElement>(null)

  // بستن با کلیک بیرون
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

  // تغییر رنگ اصلی
  const handleColorChange = (colorValue: string) => {
    setCustomColor(colorValue)
    
    // حذف کلاس‌های قبلی
    const body = document.body
    colorOptions.forEach(option => {
      body.classList.remove(`primary-color-${option.value}`)
    })
    
    // اضافه کردن کلاس جدید
    body.classList.add(`primary-color-${colorValue}`)
    
    // ذخیره در localStorage
    localStorage.setItem('primary-color', colorValue)
  }

  // بارگذاری رنگ ذخیره شده
  useEffect(() => {
    const savedColor = localStorage.getItem('primary-color')
    if (savedColor && savedColor !== 'blue') {
      const body = document.body
      colorOptions.forEach(option => {
        body.classList.remove(`primary-color-${option.value}`)
      })
      body.classList.add(`primary-color-${savedColor}`)
      setCustomColor(colorOptions.find(c => c.value === savedColor)?.color || '#4f46e5')
    }
  }, [setCustomColor])

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

        {/* Custom Color - انتخاب رنگ */}
        <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faPalette} className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Primary Color</span>
          </div>
          <div className="flex gap-2 ml-5">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`w-6 h-6 rounded-full transition-all ${
                  customColor === color.color
                    ? 'ring-2 ring-offset-2 ring-primary scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color.color }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

        {/* Security - باریک شده */}
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