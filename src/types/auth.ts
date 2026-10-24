// src/types/auth.ts

// Application roles used for routing and access decisions
export type UserRole = 'admin' | 'engineer' | 'customer' | 'staff';

export type AccountStatus = 'pending_profile' | 'pending_approval' | 'active' | 'rejected';

// Authenticated user stored in the client session.
// `mobile` and `email` are both optional since a user may register with either one.
export interface User {
  id: string;
  fullName: string;
  fullNameFa?: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  imageUrl?: string;
  avatarColor?: string;
  primaryColor?: string;
  accountStatus?: AccountStatus;
  isProfileCompleted?: boolean;
  hrApproved?: boolean;
  managerApproved?: boolean;
}
export type AppUser = User;

