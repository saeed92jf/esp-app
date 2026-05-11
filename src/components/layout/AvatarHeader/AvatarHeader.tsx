// components/layout/AvatarHeader.tsx
'use client'

import Link from 'next/link'  
import { useSession, signOut } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCog, faSignInAlt, faUserPlus, faHome } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui'
import { UserAvatar, SideMenu, SettingsModal } from '@/components/layout'
import { useUIStore } from '@/store/uiStore'

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

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
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
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-white font-semibold shadow-md">
                  <span className="text-sm">?</span>
                </div>
              )}
            </div>

            {/* Right Section - Home, Menu, Settings, Login, Sign Up */}
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  {/* Home Button */}
                  <Link href="/">
                    <button
                      className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105"
                      aria-label="Home"
                    >
                      <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                    </button>
                  </Link>

                  {/* Settings Button با container relative */}
                 <div className="relative">
  <button
    onClick={toggleSettings}
    className={`p-2.5 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 ${
      isSettingsOpen ? 'bg-gray-100 dark:bg-gray-800 scale-105' : ''
    }`}
    aria-label="Settings"
  >
    <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
  </button>
  
  {/* Settings Modal */}
  <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
</div>

                  {/* Menu Button */}
                  <button
                    onClick={openSideMenu}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105"
                    aria-label="Open menu"
                  >
                    <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/">
                    <button
                      className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105"
                      aria-label="Home"
                    >
                      <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                    </button>
                  </Link>

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

                  <Link href="/register">
                    <Button 
                      variant="primary" 
                      animation='slide-text-up'
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

      {/* Side Menu - فقط برای کاربران لاگین شده */}
      {session && (
        <SideMenu isOpen={isSideMenuOpen} onClose={closeSideMenu} />
      )}
    </>
  )
}