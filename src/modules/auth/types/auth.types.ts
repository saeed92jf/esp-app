export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole  // تغییر به نوع خاص
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
  message?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}