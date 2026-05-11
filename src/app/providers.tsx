// app/providers.tsx
'use client'

import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { useUIStore } from '@/store/uiStore'

function ColorInitializer({ children }: { children: React.ReactNode }) {
  const { setCustomColor } = useUIStore()

  useEffect(() => {
    const savedColor = localStorage.getItem('primary-color')
    if (savedColor && savedColor !== 'blue') {
      document.body.classList.add(`primary-color-${savedColor}`)
      const colorMap: Record<string, string> = {
        blue: '#4f46e5',
        green: '#10b981',
        red: '#ef4444',
        purple: '#a855f7',
        orange: '#f97316',
        pink: '#ec4899',
      }
      setCustomColor(colorMap[savedColor] || '#4f46e5')
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