// src/types/auth.ts

/**
 * Represents an authenticated user entity across the application.
 * Fields are kept optional where the auth flow may not always provide them
 * (e.g. registration via mobile leaves the email empty and vice versa).
 */
export interface User {
  // Unique identifier of the user
  id: string;
  // Email address; may be empty when the user registered with a mobile number
  email: string;
  // Mobile number; may be empty when the user registered with an email
  mobile: string;
  // Full display name of the user
  fullName: string;
  // Optional avatar URL used in the UI (header, profile, etc.)
  avatar?: string;
}

/**
 * Shape of the authentication context value exposed by AuthProvider.
 * Consumed by AuthGuard, GuestGuard and any component needing session state.
 */
export interface AuthContextValue {
  // Currently authenticated user, or null when no active session exists
  user: User | null;
  // True while the provider restores the session from localStorage on mount
  isHydrating: boolean;
  // True while an auth request (login/register) is in flight
  isLoading: boolean;
  // Authenticates the user and persists the session
  login: (emailOrMobile: string, password: string) => Promise<void>;
  // Registers a new user and persists the session
  register: (args: RegisterPayload) => Promise<void>;
  // Clears the session and removes persisted data
  logout: () => Promise<void>;
}

/**
 * Payload accepted by the register flow.
 */
export interface RegisterPayload {
  // Full display name provided at registration
  fullName: string;
  // Either an email address or a mobile number
  emailOrMobile: string;
  // Plain password (only used to simulate the request in the mock API)
  password: string;
}
