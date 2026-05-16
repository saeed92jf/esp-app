// components/layout/AvatarHeader.tsx
'use client'

import Link from 'next/link'  
import { useSession, signOut } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCog, faSignInAlt, faUserPlus, faHome } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { UserAvatar, SideMenu, SettingsModal } from '@/components/layout'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

// ============================================
// AVATAR HEADER COMPONENT
// Main navigation header with user avatar, home, settings, and menu buttons
// Shows different content based on authentication status
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

export function AvatarHeader() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  
  const { 
    isSideMenuOpen, 
    isSettingsOpen, 
    openSideMenu, 
    closeSideMenu, 
    toggleSettings,
    closeSettings
  } = useUIStore()

  // Loading state - show skeleton
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 bg-primary/80 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 bg-tertiary rounded-full animate-pulse" />
            {/* Buttons skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-tertiary rounded-xl animate-pulse" />
              <div className="w-9 h-9 bg-tertiary rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-primary/80 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left Section - User Avatar */}
            <div className="flex items-center gap-3">
              {session ? (
                <UserAvatar 
                  user={{
                    name: session.user?.name || '',
                    email: session.user?.email || '',
                    role: (session.user?.role as any) || 'CUSTOMER',
                  }}
                  onLogout={() => signOut({ callbackUrl: '/login' })}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-silver flex items-center justify-center text-inverse font-semibold shadow-md">
                  <span className="text-sm">?</span>
                </div>
              )}
            </div>

            {/* Right Section - Navigation Buttons */}
            <div className="flex items-center gap-2">
              {session ? (
                // Authenticated user buttons
                <>
                  {/* Home Button */}
                  <Link href="/">
                    <button
                      className="p-2.5 rounded-xl hover:bg-tertiary transition-all duration-200 text-secondary hover:text-primary hover:scale-105"
                      aria-label="Home"
                    >
                      <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                    </button>
                  </Link>

                  {/* Settings Button with dropdown */}
                  <div className="relative">
                    <button
                      onClick={toggleSettings}
                      className={cn(
                        'p-2.5 rounded-xl transition-all duration-200',
                        'text-secondary hover:text-primary hover:bg-tertiary hover:scale-105',
                        isSettingsOpen && 'bg-tertiary scale-105 text-primary'
                      )}
                      aria-label="Settings"
                    >
                      <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
                    </button>
                    
                    <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
                  </div>

                  {/* Menu Button */}
                  <button
                    onClick={openSideMenu}
                    className="p-2.5 rounded-xl hover:bg-tertiary transition-all duration-200 text-secondary hover:text-primary hover:scale-105"
                    aria-label="Open menu"
                  >
                    <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                  </button>
                </>
              ) : (
                // Guest user buttons
                <>
                  {/* Home Button */}
                  <Link href="/">
                    <button
                      className="p-2.5 rounded-xl hover:bg-tertiary transition-all duration-200 text-secondary hover:text-primary hover:scale-105"
                      aria-label="Home"
                    >
                      <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                    </button>
                  </Link>

                  {/* Login Button */}
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      radius="xl"
                      leftIcon={faSignInAlt}
                    >
                      <span className="hidden sm:inline">Login</span>
                      <span className="sm:hidden">Login</span>
                    </Button>
                  </Link>

                  {/* Sign Up Button */}
                  <Link href="/register">
                    <Button 
                      variant="primary" 
                      animation="slide-text-up"
                      size="sm" 
                      radius="xl"
                      leftIcon={faUserPlus}
                    >
                      <span className="hidden sm:inline">Sign Up</span>
                      <span className="sm:hidden">Sign Up</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu - only for authenticated users */}
      {session && (
        <SideMenu isOpen={isSideMenuOpen} onClose={closeSideMenu} />
      )}
    </>
  )
}