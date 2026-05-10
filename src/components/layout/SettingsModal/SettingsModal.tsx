'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faMoon, faSun, faGlobe, faBell, faShieldAlt, faLanguage } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '@/theme'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  const settingsSections = [
    {
      title: 'Appearance',
      icon: faGlobe,
      items: [
        {
          label: 'Theme',
          description: 'Choose your preferred theme',
          control: (
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faSun} className="w-3 h-3 mr-1" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faMoon} className="w-3 h-3 mr-1" />
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  theme === 'system'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                System
              </button>
            </div>
          ),
        },
      ],
    },
    {
      title: 'Preferences',
      icon: faBell,
      items: [
        {
          label: 'Notifications',
          description: 'Receive email notifications',
          control: (
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                notifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          ),
        },
        {
          label: 'Language',
          description: 'Select your preferred language',
          control: (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="en">English</option>
              <option value="fa">فارسی</option>
              <option value="es">Español</option>
            </select>
          ),
        },
      ],
    },
    {
      title: 'Security',
      icon: faShieldAlt,
      items: [
        {
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          control: (
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Configure
            </button>
          ),
        },
      ],
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-9998 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-9999 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customize your experience</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {settingsSections.map((section, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={section.icon} className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    {item.control}
                  </div>
                ))}
              </div>
              {idx < settingsSections.length - 1 && <div className="my-4 h-px bg-gray-200 dark:bg-gray-800" />}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}