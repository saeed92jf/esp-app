import { getCookie, setCookie, deleteCookie } from './cookies';

export interface StorageConfig {
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
}

export function createTokenStorage(config: StorageConfig) {
  return {
    setAuthToken(token: string, refreshToken?: string): void {
      if (!token || typeof token !== 'string' || token.trim() === '') return;
      const cleanToken = token.trim();

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(config.tokenKey, cleanToken);
          if (refreshToken) {
            localStorage.setItem(config.refreshTokenKey, refreshToken.trim());
          }
        } catch {}
      }

      setCookie(config.tokenKey, cleanToken);
      if (refreshToken) {
        setCookie(config.refreshTokenKey, refreshToken.trim());
      }
    },

    getAuthToken(): string | null {
      if (typeof window !== 'undefined') {
        try {
          const fromLocal = localStorage.getItem(config.tokenKey);
          if (fromLocal && fromLocal.trim()) return fromLocal.trim();
        } catch {}
      }
      return getCookie(config.tokenKey);
    },

    getRefreshToken(): string | null {
      if (typeof window !== 'undefined') {
        try {
          const fromLocal = localStorage.getItem(config.refreshTokenKey);
          if (fromLocal && fromLocal.trim()) return fromLocal.trim();
        } catch {}
      }
      return getCookie(config.refreshTokenKey);
    },

    clearAuthToken(): void {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(config.tokenKey);
          localStorage.removeItem(config.refreshTokenKey);
          localStorage.removeItem(config.userKey);
        } catch {}
      }
      deleteCookie(config.tokenKey);
      deleteCookie(config.refreshTokenKey);
      deleteCookie(config.userKey);
    },
  };
}
