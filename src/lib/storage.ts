/**
 * Set item in localStorage
 */
export function setLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * Get item from localStorage
 */
export function getLocalStorage<T>(key: string): T | null {
  const item = localStorage.getItem(key)
  if (!item) return null
  try {
    return JSON.parse(item) as T
  } catch {
    return null
  }
}

/**
 * Remove item from localStorage
 */
export function removeLocalStorage(key: string): void {
  localStorage.removeItem(key)
}

/**
 * Set item with expiration
 */
export function setLocalStorageWithExpiry<T>(key: string, value: T, ttlMinutes: number): void {
  const now = new Date()
  const item = {
    value,
    expiry: now.getTime() + ttlMinutes * 60 * 1000,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

/**
 * Get item with expiration
 */
export function getLocalStorageWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key)
  if (!itemStr) return null
  
  try {
    const item = JSON.parse(itemStr)
    const now = new Date()
    
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    
    return item.value as T
  } catch {
    return null
  }
}

/**
 * Clear all localStorage
 */
export function clearLocalStorage(): void {
  localStorage.clear()
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}