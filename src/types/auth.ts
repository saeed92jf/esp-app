// src/types/auth.ts

// Application roles used for routing and access decisions
export type UserRole = 'superadmin' | 'admin' | 'dept_admin' | 'office_admin' | 'manager' | 'engineer' | 'staff' | 'customer' | 'user';

export type AccountStatus =
  | 'pending_initial'
  | 'pending_profile'
  | 'pending_manager'
  | 'pending_approval'
  | 'active'
  | 'rejected';

export type DocumentCategory =
  | 'national_card_front'
  | 'national_card_back'
  | 'birth_certificate'
  | 'university_degree'
  | 'other';

export interface UserUploadedDocument {
  id: string;
  category: DocumentCategory;
  title: string;
  fileName: string;
  fileSize: number | string;
  fileType: string;
  fileData?: string; // Base64 data URL for preview
  fileUrl?: string;
  uploadedAt: string;
  verified?: boolean;
}

// Authenticated user stored in the client session.
export interface User {
  id: string;
  fullName: string;
  name?: string;
  fullNameFa?: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  imageUrl?: string;
  avatarColor?: string;
  avatarBgColor?: string;
  avatarMode?: 'photo' | 'initials';
  primaryColor?: string;
  accountStatus?: AccountStatus;
  isProfileCompleted?: boolean;
  managerApproved?: boolean;
  documents?: UserUploadedDocument[];
  department?: string;
  jobTitle?: string;
  nationalId?: string;
  // Deprecated HR field kept for backward compatibility
  hrApproved?: boolean;
  extensionNumber?: string;
  password?: string;
  modulesAccess?: Array<{ moduleId: string; hasAccess: boolean; accessLevel?: string; hoursSpent?: string; usagePercentage?: number }>;
}
export type AppUser = User;
