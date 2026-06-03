// src/types/auth.ts

// Application roles used for routing and access decisions
export type UserRole = 'admin' | 'engineer' | 'customer' | 'staff';

// Authenticated user stored in the client session.
// `mobile` and `email` are both optional since a user may register with either one.
export interface User {
  id: string;
  fullName: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  imageUrl?: string;
}
export type AppUser = User;
