'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type UserRole = 'ADMIN' | 'ENGINEER' | 'EMPLOYEE' | 'CUSTOMER'

export interface User {
  id: string
  name: string
  email: string
  role?: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TEST_USERS = [
  { email: 'admin@esp.com', password: 'admin123', role: 'ADMIN' as UserRole, name: 'Admin User', id: '1' },
  { email: 'user@esp.com', password: 'user123', role: 'CUSTOMER' as UserRole, name: 'Regular User', id: '2' },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const foundUser = TEST_USERS.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user')
    setUser(null)
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}