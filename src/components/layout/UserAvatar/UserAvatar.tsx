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
  faCrown,
  faWrench,
  faBriefcase,
  faUserAlt
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

  const mockUser = user || {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'CUSTOMER' as const,
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'avatar-admin'
      case 'ENGINEER': return 'avatar-engineer'
      case 'EMPLOYEE': return 'avatar-employee'
      default: return 'avatar-customer'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-xl bg-transparent py-0 my-0 focus:outline-none"
      >
        <div className="relative">
          <div className={`w-9 h-9 my-0 rounded-full ${getAvatarColor(mockUser.role)} flex items-center justify-center text-inverse font-semibold shadow-md`}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <FontAwesomeIcon 
                icon={getRoleIcon(mockUser.role)} 
                className="w-5 h-5"
              />
            )}
          </div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-primary my-0">
            {mockUser.name}
          </p>
          <p className="text-xs text-secondary my-0.5">
            {getRoleLabel(mockUser.role)}
          </p>
        </div>
        
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={`w-3 h-3 text-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-primary rounded-2xl shadow-xl border border-light overflow-hidden z-50 animate-fade-in-up">
          <div className="p-4 border-b border-light bg-linear-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${getAvatarColor(mockUser.role)} flex items-center justify-center text-inverse font-semibold shadow-md`}>
                <FontAwesomeIcon 
                  icon={getRoleIcon(mockUser.role)} 
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary my-0">{mockUser.name}</p>
                <p className="text-xs text-secondary mb-2">{mockUser.email}</p>
                <div className="flex items-center gap-1.5 my-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {getRoleLabel(mockUser.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-secondary hover:bg-tertiary hover:text-primary rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
              <span>My Profile</span>
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-secondary hover:bg-tertiary hover:text-primary rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-secondary hover:bg-tertiary hover:text-primary rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faCog} className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
              <span>Account Settings</span>
            </Link>

            <Link
              href="/notifications"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-secondary hover:bg-tertiary hover:text-primary rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faBell} className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
              <span>Notifications</span>
              <span className="ml-auto text-xs bg-error text-inverse px-2 py-0.5 rounded-full">3</span>
            </Link>

            {mockUser.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-secondary hover:bg-tertiary hover:text-primary rounded-xl transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
                <span>Admin Panel</span>
              </Link>
            )}
            
            <div className="my-2 h-px bg-light" />
            
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout?.()
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-error hover:bg-error/10 rounded-xl transition-colors group"
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