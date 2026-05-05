'use client'

import axios from 'axios'
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types'

const API_BASE = '/api'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE}/auth/register`, data)
    return response.data
  },

  forgotPassword: async (data: { email: string }): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`${API_BASE}/auth/forgot-password`, data)
    return response.data
  },

  resetPassword: async (data: { token: string; password: string }): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`${API_BASE}/auth/reset-password`, data)
    return response.data
  },

  logout: async () => {
    localStorage.removeItem('token')
    return { success: true }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    try {
      const response = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.data
    } catch {
      return null
    }
  },
}