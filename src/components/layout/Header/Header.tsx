'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button/Button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              ESP<span className="text-blue-600">Webapp</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-blue-600 transition">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition">
              Pricing
            </Link>
            <Link href="#reviews" className="text-gray-600 hover:text-blue-600 transition">
              Reviews
            </Link>
            <Button variant="primary" size="sm">
              Submit a Join Request
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition py-2">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition py-2">
                Pricing
              </Link>
              <Link href="#reviews" className="text-gray-600 hover:text-blue-600 transition py-2">
                Reviews
              </Link>
              <Button variant="primary" size="sm" className="w-full">
                Submit a Join Request
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}