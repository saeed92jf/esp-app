// src/hooks/useSimpleAuth.ts
'use client'

import { useEffect, useState } from 'react'

export function useSimpleAuth() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return { user, loading, logout }
}