'use client'

import { apiClient } from '@/lib/axios'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth.types'

// Mock API - در آینده با API واقعی جایگزین کن
const MOCK_DELAY = 500

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Mock API call - حذف کن وقتی API واقعی داری
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
    
    // بررسی اعتبار ساده برای دمو
    if (credentials.email === 'test@example.com' && credentials.password === '123456') {
      return {
        user: {
          id: '1',
          email: credentials.email,
          name: 'Test User',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token-123456',
      }
    }
    
    throw new Error('Invalid email or password')
    
    // وقتی API واقعی داری، از این استفاده کن:
    // const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    // return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
    
    return {
      user: {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        role: 'user',
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token-' + Date.now(),
    }
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
    // await apiClient.post('/auth/logout')
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    // Mock - از API واقعی استفاده کن
    return {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      createdAt: new Date().toISOString(),
    }
    
    // const response = await apiClient.get<User>('/auth/me')
    // return response.data
  },
}