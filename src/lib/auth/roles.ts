// src/lib/auth/roles.ts
import type { UserRole } from '@/types/auth';

// Central role -> landing path map. For this demo everyone lands on the
// role-aware dashboard at "/". Change paths here if you split per-role routes.
export const ROLE_HOME: Record<UserRole, string> = {
  admin: '/',
  engineer: '/',
  staff: '/',
  customer: '/',
};
