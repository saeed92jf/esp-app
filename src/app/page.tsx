// src/app/page.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // جلوگیری از خطای hydration mismatch: کامپوننت فقط بعد از اتصال کامل در مرورگر رندر می‌شود
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">ESP Webapp</h1>
      <p>Current theme: {theme}</p>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Toggle Theme
      </button>
    </div>
  )
}