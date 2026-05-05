'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/authApi'
import { mapToUser } from '../utils/userMapper'
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
          
          if (response.success && response.data?.token) {
            localStorage.setItem('token', response.data.token)
            set({ 
              user: response.data.user, 
              isAuthenticated: true, 
              isLoading: false 
            })
            console.log('Login successful, state updated')
            return { success: true }
          } else {
            throw new Error(response.message || 'No token received')
          }
        } catch (error: any) {
          console.error('Login error:', error)
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || error.message || 'Login failed' 
          }
        }
      },

      register: async (data) => {
        console.log('Register called with:', data.email)
        set({ isLoading: true })
        try {
          const response = await authApi.register(data)
          console.log('Register response:', response)
          
          if (response.success && response.data?.token) {
            localStorage.setItem('token', response.data.token)
            set({ 
              user: response.data.user, 
              isAuthenticated: true, 
              isLoading: false 
            })
            console.log('Register successful, state updated')
            return { success: true }
          } else {
            throw new Error(response.message || 'Registration failed')
          }
        } catch (error: any) {
          console.error('Register error:', error)
          set({ isLoading: false })
          
          return { 
            success: false, 
            error: error.response?.data?.message || error.message || 'Registration failed' 
          }
        }
      },

      logout: async () => {
        console.log('Logout called')
        set({ isLoading: true })
        try {
          await authApi.logout()
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
          console.log('Logout successful')
        } catch (error) {
          console.error('Logout error:', error)
          set({ isLoading: false })
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        console.log('Check auth, token exists:', !!token)
        
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }
        
        set({ isLoading: true })
        try {
          const user = await authApi.getCurrentUser()
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
            console.log('User authenticated:', user.email)
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false })
          }
        } catch (error) {
          console.error('Check auth error:', error)
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