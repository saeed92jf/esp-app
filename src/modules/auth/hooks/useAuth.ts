'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/authApi'
import type { User, LoginCredentials, RegisterData } from '../types/auth.types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        console.log('Login called with:', credentials.email)
        set({ isLoading: true })
        try {
          const response = await authApi.login(credentials)
          console.log('Login response:', response)
          
          if (response.token) {
            localStorage.setItem('token', response.token)
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false 
            })
            console.log('Login successful, state updated')
            return { success: true }
          } else {
            throw new Error('No token received')
          }
        } catch (error: any) {
          console.error('Login error:', error)
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.message || 'Login failed' 
          }
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(data)
          localStorage.setItem('token', response.token)
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
          return { success: true }
        } catch (error: any) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.message || 'Registration failed' 
          }
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authApi.logout()
          localStorage.removeItem('token')
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }
        
        set({ isLoading: true })
        try {
          const user = await authApi.getCurrentUser()
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false })
          }
        } catch {
          set({ isAuthenticated: false, user: null, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)