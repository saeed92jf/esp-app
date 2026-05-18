// components/layout/UserAvatar/UserAvatar.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
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
import { cn } from '@/lib/utils'

// ============================================
// USER AVATAR COMPONENT
// Displays user info with dropdown menu for profile, settings, and logout
// Role-based colors and icons (Admin, Engineer, Employee, Customer)
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

interface UserAvatarProps {
  /** User information object */
  user?: {
    name: string
    email: string
    role: 'ADMIN' | 'ENGINEER' | 'EMPLOYEE' | 'CUSTOMER'
    avatar?: string
  }
  /** Callback when user clicks logout */
  onLogout?: () => void
}

// Role-based avatar color classes 
const getAvatarColor = (role: string): string => {
  switch (role) {
    case 'ADMIN': return 'bg-gradient-logo'
    case 'ENGINEER': return 'bg-gradient-logo'
    case 'EMPLOYEE': return 'bg-gradient-logo'
    default: return 'bg-gradient-logo'
  }
}

// Role-based icon mapping
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN': return faCrown
    case 'ENGINEER': return faWrench
    case 'EMPLOYEE': return faBriefcase
    default: return faUserAlt
  }
}

// Role label mapping
const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'ADMIN': return 'ADMIN'
    case 'ENGINEER': return 'ENGINEER'
    case 'EMPLOYEE': return 'EMPLOYEE'
    default: return 'CUSTOMER'
  }
}

export function UserAvatar({ user, onLogout }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 rounded-xl bg-transparent',
          'py-0 my-0 focus:outline-none'
        )}
        aria-label="User menu"
      >
        {/* Avatar Image / Icon */}
        <div className="relative">
          <div className={cn(
            'w-9 h-9 my-0 rounded-full flex items-center justify-center',
            'text-inverse font-semibold shadow-md',
            getAvatarColor(mockUser.role)
          )}>
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <FontAwesomeIcon 
                icon={getRoleIcon(mockUser.role)} 
                className="w-5 h-5"
              />
            )}
          </div>
          {/* Online status indicator */}
          <div className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5',
            'bg-green-500 rounded-full',
            'ring-2 ring-white dark:ring-gray-900'
          )} />
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className={cn('text-sm font-semibold text-primary my-0')}>
            {mockUser.name}
          </p>
          <p className={cn('text-xs text-secondary my-0.5')}>
            {getRoleLabel(mockUser.role)}
          </p>
        </div>
        
        {/* Chevron Icon */}
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={cn(
            'w-3 h-3 text-tertiary transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          'absolute left-0 mt-2 w-72',
          'bg-primary rounded-2xl shadow-xl',
          'border border-light overflow-hidden',
          'z-50 animate-fade-in-up'
        )}>
          {/* User Info Section */}
          <div className={cn(
            'p-4 border-b border-light',
            'bg-linear-to-r from-primary/5 to-transparent'
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                'text-inverse font-semibold shadow-md',
                getAvatarColor(mockUser.role)
              )}>
                <FontAwesomeIcon 
                  icon={getRoleIcon(mockUser.role)} 
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-1">
                <p className={cn('font-semibold text-primary my-0')}>
                  {mockUser.name}
                </p>
                <p className={cn('text-xs text-secondary mb-2')}>
                  {mockUser.email}
                </p>
                <div className="flex items-center gap-1.5 my-0">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    'bg-primary/10 text-primary'
                  )}>
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
              className={cn(
                'flex items-center gap-3 px-3 py-2.5',
                'text-sm text-secondary',
                'hover:bg-tertiary hover:text-primary',
                'rounded-xl transition-colors group'
              )}
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon 
                icon={faUserCircle} 
                className={cn(
                  'w-4 h-4 text-tertiary',
                  'group-hover:text-primary transition-colors'
                )} 
              />
              <span>My Profile</span>
            </Link>
            
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5',
                'text-sm text-secondary',
                'hover:bg-tertiary hover:text-primary',
                'rounded-xl transition-colors group'
              )}
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon 
                icon={faChartLine} 
                className={cn(
                  'w-4 h-4 text-tertiary',
                  'group-hover:text-primary transition-colors'
                )} 
              />
              <span>Dashboard</span>
            </Link>
            
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5',
                'text-sm text-secondary',
                'hover:bg-tertiary hover:text-primary',
                'rounded-xl transition-colors group'
              )}
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon 
                icon={faCog} 
                className={cn(
                  'w-4 h-4 text-tertiary',
                  'group-hover:text-primary transition-colors'
                )} 
              />
              <span>Account Settings</span>
            </Link>

            <Link
              href="/notifications"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5',
                'text-sm text-secondary',
                'hover:bg-tertiary hover:text-primary',
                'rounded-xl transition-colors group'
              )}
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon 
                icon={faBell} 
                className={cn(
                  'w-4 h-4 text-tertiary',
                  'group-hover:text-primary transition-colors'
                )} 
              />
            <span>Notifications</span>
<span className={cn(
  'ml-auto text-xs font-medium tabular-nums',  
  'bg-error text-inverse',
  'min-w-6 h-6 px-1 rounded-full',
  'flex items-center justify-center'
)}>
5
</span>
            </Link>

            {/* Admin only menu item */}
            {mockUser.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5',
                  'text-sm text-secondary',
                  'hover:bg-tertiary hover:text-primary',
                  'rounded-xl transition-colors group'
                )}
                onClick={() => setIsOpen(false)}
              >
                <FontAwesomeIcon 
                  icon={faShieldAlt} 
                  className={cn(
                    'w-4 h-4 text-tertiary',
                    'group-hover:text-primary transition-colors'
                  )} 
                />
                <span>Admin Panel</span>
              </Link>
            )}
            
            {/* Divider */}
            <div className={cn('my-2 h-px bg-overlay')} />
            
            {/* Logout Button */}
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout?.()
              }}
          className={cn(
  'w-full flex items-center gap-3 px-3 py-2.5',
  'text-sm text-error',
  'hover:text-white',
  'hover:bg-gradient-danger',
  'rounded-xl',
  'group'
)}
            >
              <FontAwesomeIcon 
                icon={faSignOutAlt} 
                className={cn(
                  'w-4 h-4',
                  'group-hover:scale-110 transition-transform'
                )} 
              />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}