// components/layout/UserAvatar/UserAvatar.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUser, 
  faCog, 
  faSignOutAlt, 
  faUserCircle,
  faChevronDown,
  faChartLine,
  faBell,
  faShieldAlt,
  faCrown,        // برای ادمین
  faWrench,       // برای مهندس
  faBriefcase,    // برای کارمند
  faUserAlt       // برای مشتری
} from '@fortawesome/free-solid-svg-icons'

interface UserAvatarProps {
  user?: {
    name: string
    email: string
    role: 'ADMIN' | 'ENGINEER' | 'EMPLOYEE' | 'CUSTOMER'
    avatar?: string
  }
  onLogout?: () => void
}

export function UserAvatar({ user, onLogout }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock user data for demo
  const mockUser = user || {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'CUSTOMER' as const,
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // آیکون‌های FontAwesome برای نقش‌ها
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return faCrown     
      case 'ENGINEER': return faWrench  
      case 'EMPLOYEE': return faBriefcase
      default: return faUserAlt      
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'ADMIN'
      case 'ENGINEER': return 'ENGINEER'
      case 'EMPLOYEE': return 'EMPLOYEE'
      default: return 'CUSTOMER'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'from-purple-500 to-purple-600'
      case 'ENGINEER': return 'from-blue-500 to-blue-600'
      case 'EMPLOYEE': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-gradient-to-br from-purple-500 to-purple-600'
      case 'ENGINEER': return 'bg-gradient-to-br from-blue-500 to-blue-600'
      case 'EMPLOYEE': return 'bg-gradient-to-br from-green-500 to-green-600'
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
      >
        {/* Avatar Image / Icon */}
        <div className="relative">
          <div className={`w-10 h-10 rounded-full ${getAvatarColor(mockUser.role)} flex items-center justify-center text-white font-semibold shadow-md group-hover:scale-105 transition-transform`}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-base">
                {mockUser.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </div>
        
        {/* User Info with Role under name */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {mockUser.name}
          </p>
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon 
              icon={getRoleIcon(mockUser.role)} 
              className="w-3 h-3 text-gray-500 dark:text-gray-400" 
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getRoleLabel(mockUser.role)}
            </p>
          </div>
        </div>
        
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-primary-50/50 to-transparent dark:from-primary-900/20">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${getAvatarColor(mockUser.role)} flex items-center justify-center text-white font-semibold shadow-md`}>
                {mockUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{mockUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{mockUser.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <FontAwesomeIcon 
                    icon={getRoleIcon(mockUser.role)} 
                    className="w-3 h-3 text-primary-500" 
                  />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    {getRoleLabel(mockUser.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span>My Profile</span>
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faCog} className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span>Account Settings</span>
            </Link>

            <Link
              href="/notifications"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faBell} className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span>Notifications</span>
              <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">3</span>
            </Link>

            {/* Admin only menu item */}
            {mockUser.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                <span>Admin Panel</span>
              </Link>
            )}
            
            {/* Divider */}
            <div className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
            
            {/* Logout Button */}
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout?.()
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}