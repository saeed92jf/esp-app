// app/providers.tsx
'use client'

import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { useUIStore } from '@/store/uiStore'
// app/providers.tsx

function ColorInitializer({ children }: { children: React.ReactNode }) {
  const { setCustomColor } = useUIStore()

  useEffect(() => {
    const savedColorClass = localStorage.getItem('primary-color')
    
    if (savedColorClass && savedColorClass !== 'primary-color-red') {
      document.documentElement.classList.add(savedColorClass)
      
      const colorMap: Record<string, string> = {
        'primary-color-blue': '#4f46e5',
        'primary-color-green': '#10b981',
        'primary-color-red': '#ef4444',
        'primary-color-orange': '#f97316',
        'primary-color-purple': '#a855f7',
      }
      setCustomColor(colorMap[savedColorClass] || '#ef4444')
    }
  }, [setCustomColor])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ColorInitializer>
          {children}
        </ColorInitializer>
      </ThemeProvider>
    </SessionProvider>
  )
}