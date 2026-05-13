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

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('menu-open')
    } else {
      document.body.style.overflow = 'unset'
      document.body.classList.remove('menu-open')
    }
    
    return () => {
      document.body.style.overflow = 'unset'
      document.body.classList.remove('menu-open')
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
      <div 
        className={`side-menu-backdrop ${isOpen ? 'open' : 'closed'}`}
        onClick={onClose}
      />
      
      <div className={`side-menu-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="side-menu-header">
          <div>
            <h2 className="side-menu-title">Menu</h2>
            <p className="side-menu-subtitle">Navigate through the app</p>
          </div>
          <button onClick={onClose} className="side-menu-close-btn">
            <FontAwesomeIcon icon={faTimes} className="side-menu-close-icon" />
          </button>
        </div>

        <div className="side-menu-content">
          <div className="side-menu-items">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`side-menu-link ${isActive ? 'active' : 'inactive'}`}
                >
                  <FontAwesomeIcon icon={item.icon} className="side-menu-icon" />
                  <span className="side-menu-label">{item.label}</span>
                  {isActive && <span className="side-menu-active-indicator" />}
                </Link>
              )
            })}
          </div>

          <div className="side-menu-divider" />

          <div className="side-menu-items">
            {footerItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="side-menu-link inactive"
              >
                <FontAwesomeIcon icon={item.icon} className="side-menu-icon" />
                <span className="side-menu-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="side-menu-footer">
          <p className="side-menu-version">ESP Webapp v1.0.0</p>
        </div>
      </div>
    </>
  )
}