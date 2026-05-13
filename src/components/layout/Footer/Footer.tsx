'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/Logo/Logo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faTwitter, 
  faLinkedin, 
  faGithub, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'

export function Footer() {
  const year = new Date().getFullYear()
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sections = [
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Help Center', href: '/help' },
        { name: 'API Status', href: '/status' },
        { name: 'Support', href: '/support' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
        { name: 'Security', href: '/security' },
        { name: 'Cookies', href: '/cookies' },
      ],
    },
  ]

  const socialLinks = [
    { icon: faTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: faLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: faGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: faInstagram, href: 'https://instagram.com', label: 'Instagram' },
  ]

  return (
    <>
      <footer className="relative bg-secondary border-t border-light">
        {/* Main Footer */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
              <Logo variant="footer" />
              <p className="text-secondary text-xs mt-4 leading-relaxed">
                Unified platform for engineering and service businesses.
                
              </p>
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-tertiary text-secondary hover:bg-primary hover:text-inverse flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                    aria-label={social.label}
                  >
                    <FontAwesomeIcon icon={social.icon} className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-primary mb-4 text-sm uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-secondary hover:text-primary text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-light flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-tertiary text-sm">
              &copy; {year} ESP Webapp. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-tertiary hover:text-primary text-xs transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-tertiary hover:text-primary text-xs transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-tertiary hover:text-primary text-xs transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full bg-primary text-inverse shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4" />
      </button>
    </>
  )
}