// components/layout/SideMenu.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faTimes, 
  faHome, 
  faChartLine, 
  faUsers, 
  faFolder, 
  faCog, 
  faQuestionCircle,
  faEnvelope,
  faCalendar,
  faClock,
  faFileInvoice
} from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

// ============================================
// SIDE MENU COMPONENT
// Slide-out navigation menu from the right side
// Opens below the header, does not cover the full screen
// Uses Tailwind CSS only - no separate CSS file needed
// ============================================

interface SideMenuProps {
  /** Whether the menu is open */
  isOpen: boolean
  /** Callback to close the menu */
  onClose: () => void
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Prevent body scroll when menu is open
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

  const menuItems = [
    { icon: faHome, label: 'Dashboard', href: '/dashboard' },
    { icon: faChartLine, label: 'Analytics', href: '/analytics' },
    { icon: faUsers, label: 'CRM', href: '/crm' },
    { icon: faFolder, label: 'Projects', href: '/projects' },
    { icon: faCalendar, label: 'Calendar', href: '/calendar' },
    { icon: faClock, label: 'Time Tracking', href: '/time' },
    { icon: faFileInvoice, label: 'Invoices', href: '/invoices' },
  ]

  const footerItems = [
    { icon: faCog, label: 'Settings', href: '/settings' },
    { icon: faQuestionCircle, label: 'Help & Support', href: '/support' },
    { icon: faEnvelope, label: 'Contact', href: '/contact' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          'fixed inset-0 bg-black/30 transition-all duration-300 z-40',
          'top-(--header-height,56px) md:top-(--header-height,64px)',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={onClose}
      />
      
      {/* Side Menu Panel */}
      <div 
        className={cn(
          'fixed right-0 z-40 flex flex-col',
          'w-80 bg-primary shadow-2xl',
          'transition-transform duration-500 ease-out',
          'top-(--header-height,56px) md:top-(--header-height,64px)',
          'h-[calc(100vh-var(--header-height,56px))] md:h-[calc(100vh-var(--header-height,64px))]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-light bg-primary  ">
          <div>
            <h2 className="text-xl font-bold text-primary">Menu</h2>
            <p className="text-xs text-secondary">Navigate through the app</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-tertiary transition-all duration-200 hover:scale-105"
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-tertiary" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-linear-to-r from-primary to-primary-600 text-inverse shadow-md'
                      : 'text-secondary hover:bg-tertiary hover:text-primary'
                  )}
                >
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      !isActive && 'group-hover:scale-110'
                    )} 
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-inverse rounded-full animate-pulse" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-linear-to-r from-transparent via-light to-transparent" />

          {/* Footer Items */}
          <div className="flex flex-col gap-1">
            {footerItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-secondary hover:bg-tertiary hover:text-primary transition-all duration-200 group"
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className="w-5 h-5 transition-transform group-hover:scale-110" 
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-light bg-primary rounded-br-2xl">
          <p className="text-xs text-center text-tertiary">
            ESP Webapp v1.0.0
          </p>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--bg-tertiary);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-medium);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--border-dark);
        }
      `}</style>
    </>
  )
}