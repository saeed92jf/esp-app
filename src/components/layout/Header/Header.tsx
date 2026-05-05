'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo/Logo'
import { MegaMenu } from '@/components/layout/MegaMenu/MegaMenu'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Logo />

          <MegaMenu />

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary btn-md">
              Submit
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-2">
              <MobileNavItem title="Company">
                <MobileSub href="/company/story">Our Story</MobileSub>
                <MobileSub href="/company/mission">Mission</MobileSub>
                <MobileSub href="/company/careers">Careers</MobileSub>
              </MobileNavItem>
              <MobileNavItem title="HR">
                <MobileSub href="/hr/ats">ATS</MobileSub>
                <MobileSub href="/hr/directory">Directory</MobileSub>
                <MobileSub href="/hr/payroll">Payroll</MobileSub>
              </MobileNavItem>
              <MobileNavItem title="Marketing">
                <MobileSub href="/marketing/email">Email</MobileSub>
                <MobileSub href="/marketing/social">Social</MobileSub>
                <MobileSub href="/marketing/dashboard">Dashboard</MobileSub>
              </MobileNavItem>
              <MobileNavItem title="Project">
                <MobileSub href="/project/roadmap">Roadmap</MobileSub>
                <MobileSub href="/project/tasks">Tasks</MobileSub>
                <MobileSub href="/project/time">Time</MobileSub>
              </MobileNavItem>
              <Link href="/about" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                About
              </Link>
              <Link href="/contact" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                Contact
              </Link>
              <div className="flex gap-3 pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                <Link href="/login" className="flex-1 text-center px-4 py-2 border rounded-lg hover:border-primary">
                  Sign In
                </Link>
                <Link href="/register" className="flex-1 text-center px-4 py-2 bg-primary text-white rounded-lg">
                  Submit
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function MobileNavItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
      >
        <span>{title}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all pl-4 ${open ? 'max-h-96' : 'max-h-0'}`}>{children}</div>
    </div>
  )
}

function MobileSub({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
      {children}
    </Link>
  )
}