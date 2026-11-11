// src/lib/auth/token-storage.ts
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/services/core/types";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Reads a cookie by name on client-side.
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const raw = parts.pop()?.split(";").shift();
    return raw ? decodeURIComponent(raw) : null;
  }
  return null;
}

/**
 * Sets a cookie with standard attributes for cross-page session persistence.
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number = COOKIE_MAX_AGE_SECONDS): void {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

/**
 * Deletes a cookie by expiring it immediately.
 */
export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * Centrally stores the authentication token in both localStorage and HTTP cookie.
 * This guarantees both instant client retrieval and server/middleware access.
 */
export function setAuthToken(token: string, refreshToken?: string): void {
  if (!token || typeof token !== "string" || token.trim() === "") return;
  const cleanToken = token.trim();

  // 1. Client Storage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, cleanToken);
      if (refreshToken) {
        localStorage.setItem("esp-refresh-token", refreshToken.trim());
      }
    } catch {}
  }

  // 2. Cookie for SSR and Edge Middleware
  setCookie(AUTH_TOKEN_KEY, cleanToken);
}

/**
 * Synchronously retrieves the authentication token from localStorage or cookie.
 */
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(AUTH_TOKEN_KEY);
      if (local && local.trim() && local !== "undefined" && local !== "null") {
        return local.trim();
      }
    } catch {}
  }

  const cookieVal = getCookie(AUTH_TOKEN_KEY);
  if (cookieVal && cookieVal.trim() && cookieVal !== "undefined" && cookieVal !== "null") {
    return cookieVal.trim();
  }

  return null;
}

/**
 * Completely clears all authentication tokens and session data from client storage and cookies.
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem("esp-refresh-token");
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem("esp_auth_user");
      localStorage.removeItem("esp_user_profile");
    } catch {}
  }

  deleteCookie(AUTH_TOKEN_KEY);
  deleteCookie("esp_auth_token");
  deleteCookie("token");
}

/**
 * Synchronizes localStorage and Cookies in case one is populated while the other is missing.
 */
export function syncAuthToken(): void {
  if (typeof window === "undefined") return;

  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const cookieToken = getCookie(AUTH_TOKEN_KEY);

  if (localToken && localToken.trim() && localToken !== "undefined" && localToken !== "null") {
    if (!cookieToken || cookieToken !== localToken) {
      setCookie(AUTH_TOKEN_KEY, localToken.trim());
    }
  } else if (cookieToken && cookieToken.trim() && cookieToken !== "undefined" && cookieToken !== "null") {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, cookieToken.trim());
    } catch {}
  }
}

/**
 * Checks whether a valid non-empty auth token is currently present.
 */
export function hasValidAuthToken(): boolean {
  const token = getAuthToken();
  return Boolean(token && token.trim().length > 0 && token !== "undefined" && token !== "null");
}

