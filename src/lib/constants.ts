export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ESP-App'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const IS_TEST = process.env.NODE_ENV === 'test'

export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_PAGE = 1

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  CART: 'cart',
} as const