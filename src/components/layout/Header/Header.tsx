'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo,Button } from '@/components/ui'
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-primary/95 backdrop-blur-md shadow-md' : 'bg-primary'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Logo />

          <MegaMenu />

          <div className="hidden lg:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-secondary hover:text-primary transition-colors font-medium"
            >
              Sign In
            </Link>
            <Button variant="primary" size="sm" asChild>
              <Link href="/register">Submit</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-tertiary transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`
            lg:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isMenuOpen ? 'max-h-[calc(100vh-64px)] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="py-4 border-t border-light">
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
              <Link 
                href="/about" 
                className="px-3 py-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="px-3 py-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
              >
                Contact
              </Link>
              <div className="flex gap-3 pt-3 mt-2 border-t border-light">
                <Link 
                  href="/login" 
                  className="flex-1 text-center px-4 py-2 border border-light rounded-lg hover:border-primary transition-colors text-secondary hover:text-primary"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="flex-1 text-center px-4 py-2 bg-primary text-inverse rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit
                </Link>
              </div>
            </div>
          </div>
        </div>
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
        className="w-full flex justify-between items-center px-3 py-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
      >
        <span className="font-medium">{title}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out pl-4 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  )
}

function MobileSub({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="block px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
    >
      {children}
    </Link>
  )
}