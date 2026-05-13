'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

const menuItems = [
  {
    title: 'Company',
    megaMenu: {
      columns: [
        {
          title: 'About',
          items: [
            { name: 'Our Story', href: '/company/story', desc: 'Learn about our journey' },
            { name: 'Mission', href: '/company/mission', desc: 'What drives us' },
            { name: 'Careers', href: '/company/careers', desc: 'Join our team' },
          ]
        },
        {
          title: 'Resources',
          items: [
            { name: 'Blog', href: '/blog', desc: 'Latest insights' },
            { name: 'Press', href: '/press', desc: 'News & updates' },
            { name: 'Events', href: '/events', desc: 'Webinars & events' },
          ]
        },
        {
          title: 'Contact',
          items: [
            { name: 'Support', href: '/support', desc: 'Get help' },
            { name: 'Sales', href: '/contact/sales', desc: 'Talk to sales' },
          ]
        },
      ]
    }
  },
  {
    title: 'HR',
    megaMenu: {
      columns: [
        {
          title: 'Recruitment',
          items: [
            { name: 'ATS', href: '/hr/ats', desc: 'Track candidates' },
            { name: 'Job Posting', href: '/hr/jobs', desc: 'Post openings' },
          ]
        },
        {
          title: 'Management',
          items: [
            { name: 'Directory', href: '/hr/directory', desc: 'Find employees' },
            { name: 'Onboarding', href: '/hr/onboarding', desc: 'New hire process' },
          ]
        },
        {
          title: 'Payroll',
          items: [
            { name: 'Payroll', href: '/hr/payroll', desc: 'Manage payroll' },
            { name: 'Benefits', href: '/hr/benefits', desc: 'Employee benefits' },
          ]
        },
      ]
    }
  },
  {
    title: 'Marketing',
    megaMenu: {
      columns: [
        {
          title: 'Campaigns',
          items: [
            { name: 'Email', href: '/marketing/email', desc: 'Email campaigns' },
            { name: 'Social', href: '/marketing/social', desc: 'Social management' },
          ]
        },
        {
          title: 'Analytics',
          items: [
            { name: 'Dashboard', href: '/marketing/dashboard', desc: 'View metrics' },
            { name: 'Reports', href: '/marketing/reports', desc: 'Custom reports' },
          ]
        },
        {
          title: 'Content',
          items: [
            { name: 'Calendar', href: '/marketing/calendar', desc: 'Plan content' },
            { name: 'Assets', href: '/marketing/assets', desc: 'Manage assets' },
          ]
        },
      ]
    }
  },
  {
    title: 'Project',
    megaMenu: {
      columns: [
        {
          title: 'Planning',
          items: [
            { name: 'Roadmap', href: '/project/roadmap', desc: 'Project timeline' },
            { name: 'Sprints', href: '/project/sprints', desc: 'Manage sprints' },
          ]
        },
        {
          title: 'Execution',
          items: [
            { name: 'Tasks', href: '/project/tasks', desc: 'Manage tasks' },
            { name: 'Time', href: '/project/time', desc: 'Track time' },
          ]
        },
        {
          title: 'Reporting',
          items: [
            { name: 'Progress', href: '/project/progress', desc: 'View progress' },
            { name: 'Burndown', href: '/project/burndown', desc: 'Burndown charts' },
          ]
        },
      ]
    }
  },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' },
]

export function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const megaMenuRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (title: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(title)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const getActiveItem = () => {
    return menuItems.find(item => item.title === activeMenu)
  }

  const activeItem = getActiveItem()

  return (
    <>
      {/* Menu Bar - بدون wrap با اسکرول در موبایل */}
      <div className="relative w-full">
        <div className="overflow-x-auto scrollbar-none lg:overflow-visible">
          <nav className="flex items-center gap-1 min-w-max lg:min-w-0">
            {menuItems.map((item) => {
              const hasMega = !!item.megaMenu
              const isActive = activeMenu === item.title

              return (
                <div
                  key={item.title}
                  className="relative"
                  onMouseEnter={() => hasMega && handleMouseEnter(item.title)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={cn(
                        "px-4 py-2 text-secondary hover:text-primary transition-colors font-medium rounded-lg hover:bg-tertiary whitespace-nowrap",
                        isActive && "text-primary bg-tertiary"
                      )}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <button
                      className={cn(
                        "px-4 py-2 text-secondary hover:text-primary transition-all duration-200 font-medium rounded-lg hover:bg-tertiary flex items-center gap-1 whitespace-nowrap",
                        isActive && "text-primary bg-tertiary"
                      )}
                    >
                      {item.title}
                      <svg
                        className={cn(
                          "w-4 h-4 transition-all duration-200",
                          isActive && "rotate-180 text-primary"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      {/* MegaMenu Backdrop */}
      {activeItem?.megaMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300"
          style={{ top: 'var(--header-height, 64px)' }}
          onMouseEnter={handleMouseLeave}
        />
      )}

      {/* MegaMenu Content - Full Width Responsive */}
      <div 
        ref={megaMenuRef}
        className={cn(
          "fixed left-0 right-0 z-50 bg-primary shadow-2xl border-t border-light transition-all duration-300 overflow-hidden",
          activeItem?.megaMenu 
            ? "opacity-100 visible translate-y-0" 
            : "opacity-0 invisible -translate-y-4 pointer-events-none"
        )}
        style={{ top: 'var(--header-height, 64px)' }}
        onMouseEnter={() => activeItem?.megaMenu && handleMouseEnter(activeItem.title)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {activeItem?.megaMenu?.columns.map((column, idx) => (
                <div 
                  key={idx} 
                  className="animate-fade-in-up" 
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <h3 className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-4">
                    {column.title}
                  </h3>
                  <ul className="space-y-2">
                    {column.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link
                          href={item.href}
                          onClick={() => setActiveMenu(null)}
                          className="group block p-3 -m-3 rounded-xl transition-all duration-200 hover:bg-tertiary hover:translate-x-1"
                        >
                          <div className="font-medium text-primary group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          {item.desc && (
                            <p className="text-sm text-secondary mt-1 group-hover:text-secondary transition-colors">
                              {item.desc}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative bottom gradient */}
        <div className="h-0.5 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}